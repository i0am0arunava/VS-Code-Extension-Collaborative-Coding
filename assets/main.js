document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name-input");
  const roomInput = document.getElementById("room-input");
  const joinButton = document.getElementById("join-button");
  const membersList = document.getElementById("members-list");
  const roomTitle = document.getElementById("room-title");
  const memberCount = document.getElementById("member-count");

  const demoMembers = ["Aarav", "Ishita", "Dev"];

  function createMember(name, role, active = true) {
    const member = document.createElement("div");
    member.className = "member-card";

    member.innerHTML = `
      <div class="avatar">${name.charAt(0).toUpperCase()}</div>
      <div class="member-info">
        <strong>${name}</strong>
        <span>${role}</span>
      </div>
      <div class="${active ? "online" : "idle"}"></div>
    `;

    return member;
  }

  function joinRoom() {
    const name = nameInput.value.trim();
    const room = roomInput.value.trim();

    if (!name || !room) {
      joinButton.textContent = "Enter details first";
      setTimeout(() => {
        joinButton.textContent = "Join Room";
      }, 1200);
      return;
    }

    membersList.innerHTML = "";
    roomTitle.textContent = `Room #${room}`;

    membersList.appendChild(createMember(name, "You • Code Editor Host"));

    demoMembers.forEach((member, index) => {
      membersList.appendChild(
        createMember(member, index === 0 ? "Editing index.ts" : "Viewing workspace")
      );
    });

    memberCount.textContent = `${demoMembers.length + 1} online`;
    joinButton.textContent = "Joined";
    joinButton.classList.add("joined");
  }

  joinButton.addEventListener("click", joinRoom);

  [nameInput, roomInput].forEach((input) => {
    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        joinRoom();
      }
    });
  });
});