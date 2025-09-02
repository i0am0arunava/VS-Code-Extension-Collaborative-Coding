
import * as vscode from 'vscode';
import { CustomSidebarViewProvider } from './customSidebarViewProvider';
import * as path from 'path';
import { io } from "socket.io-client";
import * as fs from 'fs';
// --- Socket setup ---
const socket = io("https://socketserver-2.onrender.com");
const ROOM_NAME = "vscode-room";
let changeTimeout: NodeJS.Timeout | null = null;
socket.on("connect", () => {
	console.log(" Connected to socket server:", socket.id);
	socket.emit("join-room", ROOM_NAME);
});


socket.on("file-update", async ({ file, content, sender }) => {
  if (sender === socket.id) {
	return;
  } 
    console.log(` Received update for ${file}: \n`, content);

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        console.error("No workspace open, cannot update file");
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const filePath = path.join(rootPath, file);

    try {
       
        const doc = await vscode.workspace.openTextDocument(filePath);

       
        const editor = await vscode.window.showTextDocument(doc, { preview: false });

        
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

	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) return;

	const rootPath = workspaceFolders[0].uri.fsPath;
	const filePath = path.join(rootPath, file);

	// Check if file exists
	if (!fs.existsSync(filePath)) {
		console.warn(` File ${file} does not exist locally. Creating it.`);
		// Create an empty file
		fs.writeFileSync(filePath, "", { flag: "w" });
	}

	try {
		const doc = await vscode.workspace.openTextDocument(filePath);
		await vscode.window.showTextDocument(doc, { preview: false });
		console.log(` ${file} opened because another user opened it`);
	} catch (err) {
		console.error("Error opening file:", err);
	}
});




export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-extension-sidebar-html" is active!');


	const textChangeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) return;

	// get relative path of the file to workspace
	const file = path.relative(workspaceFolders[0].uri.fsPath, event.document.uri.fsPath);
	const content = event.document.getText();

	
	if (changeTimeout) clearTimeout(changeTimeout);
	changeTimeout = setTimeout(() => {
		socket.emit("file-update", {
			room: ROOM_NAME,
			file,
			content,
			sender: socket.id
		});
		console.log(` Update sent for ${file}`);
	}, 500);
});

   
	 const openFileDisposable = vscode.workspace.onDidOpenTextDocument(doc => {
		const file = path.relative(vscode.workspace.workspaceFolders![0].uri.fsPath, doc.uri.fsPath);
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
