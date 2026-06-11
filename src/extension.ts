
import * as vscode from 'vscode';
import { CustomSidebarViewProvider } from './customSidebarViewProvider';
import * as path from 'path';
import * as fs from 'fs';

const socketIo = require("../vendor/socket.io") as { io: typeof import("socket.io-client").io };

const ROOM_NAME = "vscode-room";
const REMOTE_EVENT_SUPPRESSION_MS = 1000;
const changeTimeouts = new Map<string, NodeJS.Timeout>();
const remoteOpenFiles = new Set<string>();
const remoteChangeFiles = new Set<string>();
const remoteOpenTimers = new Map<string, NodeJS.Timeout>();
const remoteChangeTimers = new Map<string, NodeJS.Timeout>();

function getWorkspaceRelativePath(uri: vscode.Uri): string | undefined {
	if (uri.scheme !== "file") {
		return undefined;
	}

	const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
	if (!workspaceFolder) {
		return undefined;
	}

	const relativePath = path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
	return relativePath.split(path.sep).join("/");
}

function getWorkspaceFilePath(file: string): string | undefined {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		console.error("No workspace open, cannot sync file");
		return undefined;
	}

	return path.join(workspaceFolders[0].uri.fsPath, file);
}

function ensureLocalFile(filePath: string, content = "") {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, content, { flag: "w" });
	}
}

function markRemoteEvent(set: Set<string>, timers: Map<string, NodeJS.Timeout>, file: string) {
	set.add(file);

	const existingTimer = timers.get(file);
	if (existingTimer) {
		clearTimeout(existingTimer);
	}

	const timer = setTimeout(() => {
		set.delete(file);
		timers.delete(file);
	}, REMOTE_EVENT_SUPPRESSION_MS);
	timers.set(file, timer);
}

function clearPendingLocalUpdate(file: string) {
	const timeout = changeTimeouts.get(file);
	if (!timeout) {
		return;
	}

	clearTimeout(timeout);
	changeTimeouts.delete(file);
}

function getSocketServerUrl(): string {
	const configuredUrl = vscode.workspace
		.getConfiguration("codeTogether")
		.get<string>("serverUrl");

	return configuredUrl?.trim() || "http://localhost:3000";
}

function setupSocket(context: vscode.ExtensionContext) {
	const socket = socketIo.io(getSocketServerUrl());

	socket.on("connect", () => {
		console.log(" Connected to socket server:", socket.id);
		socket.emit("join-room", ROOM_NAME);
	});

	socket.on("connect_error", (err) => {
		console.error("Could not connect to socket server:", err.message);
	});

	socket.on("file-update", async ({ file, content, sender }) => {
		if (sender === socket.id) {
			return;
		}
		console.log(` Received update for ${file}: \n`, content);
		clearPendingLocalUpdate(file);

		const filePath = getWorkspaceFilePath(file);
		if (!filePath) {
			return;
		}

		try {
			ensureLocalFile(filePath);
			markRemoteEvent(remoteOpenFiles, remoteOpenTimers, file);
			const doc = await vscode.workspace.openTextDocument(filePath);
			const editor = await vscode.window.showTextDocument(doc, { preview: false });

			if (doc.getText() === content) {
				console.log(`Skipped ${file}; remote content already matches local content`);
				return;
			}

			markRemoteEvent(remoteChangeFiles, remoteChangeTimers, file);
			await editor.edit(editBuilder => {
				const fullRange = new vscode.Range(
					doc.positionAt(0),
					doc.positionAt(doc.getText().length)
				);
				editBuilder.replace(fullRange, content);
			});

			console.log(`Updated ${file} with new content from server`);
		} catch (err) {
			console.error(" Error updating file:", err);
		}
	});

	socket.on("file-open", async ({ file, sender }) => {
		if (sender === socket.id) return;

		const filePath = getWorkspaceFilePath(file);
		if (!filePath) {
			return;
		}

		try {
			ensureLocalFile(filePath);
			markRemoteEvent(remoteOpenFiles, remoteOpenTimers, file);
			const doc = await vscode.workspace.openTextDocument(filePath);
			await vscode.window.showTextDocument(doc, { preview: false });
			console.log(` ${file} opened because another user opened it`);
		} catch (err) {
			console.error("Error opening file:", err);
		}
	});

	context.subscriptions.push({
		dispose: () => socket.disconnect()
	});

	return socket;
}




export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-extension-sidebar-html" is active!');

	const socket = setupSocket(context);

	const textChangeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
		const file = getWorkspaceRelativePath(event.document.uri);
		if (!file) return;
		if (remoteChangeFiles.has(file)) {
			clearPendingLocalUpdate(file);
			return;
		}
		const content = event.document.getText();

		clearPendingLocalUpdate(file);
		const timeout = setTimeout(() => {
			socket.emit("file-update", {
				room: ROOM_NAME,
				file,
				content,
				sender: socket.id
			});
			changeTimeouts.delete(file);
			console.log(` Update sent for ${file}`);
		}, 500);
		changeTimeouts.set(file, timeout);
	});

	const openFileDisposable = vscode.workspace.onDidOpenTextDocument(doc => {
		const file = getWorkspaceRelativePath(doc.uri);
		if (!file || remoteOpenFiles.has(file)) return;

		socket.emit("file-open", { room: ROOM_NAME, file, sender: socket.id });
		console.log(` File opened: ${file}`);
	});



	
	const provider = new CustomSidebarViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			CustomSidebarViewProvider.viewType,
			provider
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("vscodeSidebar.menu.view", () => {
			vscode.window.showInformationMessage("Menu/Title of extension is clicked!");
		})
	);

	let openWebView = vscode.commands.registerCommand('vscodeSidebar.openview', () => {
		vscode.window.showInformationMessage('Command " Sidebar View [vscodeSidebar.openview] " called.');
	});
	context.subscriptions.push(openWebView);
	context.subscriptions.push(textChangeDisposable,openFileDisposable);
}


export function deactivate() {}
