import * as vscode from "vscode";

export class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vscodeSidebar.openview";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this.getHtmlContent(webviewView.webview);
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "main.js")
    );

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "reset.css")
    );

    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "vscode.css")
    );

    const stylesheetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "main.css")
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="${styleResetUri}" rel="stylesheet" />
  <link href="${styleVSCodeUri}" rel="stylesheet" />
  <link href="${stylesheetUri}" rel="stylesheet" />
  <title>Collaborative Code Editor</title>
</head>
<body>
  <main class="collab-shell">
    <section class="hero-panel">
      <div class="brand">
        <div class="brand-icon">⌘</div>
        <div>
          <p class="eyebrow">Live Collaborative Workspace</p>
          <h1>CodeRoom</h1>
        </div>
      </div>

      <p class="hero-text">
        Join a room and start coding together with your teammates in real time.
      </p>

      <div class="room-status">
        <span class="status-dot"></span>
        Waiting to join room
      </div>
    </section>

    <section class="join-panel">
      <label for="name-input">Your Name</label>
      <input id="name-input" type="text" placeholder="Enter your name" />

      <label for="room-input">Room Number</label>
      <input id="room-input" type="text" placeholder="Enter room number" />

      <button id="join-button">Join Room</button>
    </section>

    <section class="room-panel">
      <div class="section-header">
        <div>
          <p class="eyebrow">Current Room</p>
          <h2 id="room-title">Not joined</h2>
        </div>
        <span id="member-count">0 online</span>
      </div>

      <div id="members-list" class="members-list">
        <div class="empty-state">
          Enter your name and room number to view joined roommates.
        </div>
      </div>
    </section>
  </main>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}