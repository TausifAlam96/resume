// Basic UI logic to toggle edit mode and persist data
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const printBtn = document.getElementById("printBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

let editing = false;
const editableEls = document.querySelectorAll('[contenteditable="false"]');

function toggleEdit(on) {
  editing = typeof on === "boolean" ? on : !editing;
  editableEls.forEach((el) => el.setAttribute("contenteditable", editing));
  editBtn.textContent = editing ? "Stop editing" : "Edit";
  if (editing) editableEls[0].focus();
}

function gatherData() {
  const data = {};
  const fields = [
    "fullName",
    "tagline",
    "contact",
    "summary",
    "skills",
    "experience",
    "education",
    "projects",
    "certs",
  ];
  data.fullName = document.getElementById("fullName").innerText.trim();
  data.tagline = document.getElementById("tagline").innerText.trim();
  data.contact = document.getElementById("contact").innerText.trim();
  data.summary = document.getElementById("summary").innerText.trim();

  // skills: read skill names and percent
  data.skills = Array.from(document.querySelectorAll(".skills .skill")).map(
    (s) => ({
      name: s.querySelector("div").innerText,
      percent: s.querySelector(".bar > span").style.width,
    })
  );

  // experience
  data.experience = Array.from(
    document.querySelectorAll("#experience .job")
  ).map((j) => ({
    title: j.querySelector("h4").innerText,
    meta: j.querySelector(".meta").innerText,
    desc: j.querySelector("p").innerText,
  }));

  data.education = document.getElementById("education").innerText.trim();
  data.projects = Array.from(document.querySelectorAll("#projects li")).map(
    (li) => li.innerText
  );
  data.certs = Array.from(document.querySelectorAll("#certs li")).map(
    (li) => li.innerText
  );
  return data;
}

function applyData(data) {
  if (!data) return;
  if (data.fullName)
    document.getElementById("fullName").innerText = data.fullName;
  if (data.tagline) document.getElementById("tagline").innerText = data.tagline;
  if (data.contact) document.getElementById("contact").innerText = data.contact;
  if (data.summary) document.getElementById("summary").innerText = data.summary;

  if (Array.isArray(data.skills)) {
    const skillEls = document.querySelectorAll(".skills .skill");
    data.skills.forEach((s, i) => {
      if (skillEls[i]) {
        skillEls[i].querySelector("div").innerText =
          s.name || skillEls[i].querySelector("div").innerText;
        skillEls[i].querySelector(".bar > span").style.width =
          s.percent || skillEls[i].querySelector(".bar > span").style.width;
      }
    });
  }

  if (Array.isArray(data.experience)) {
    const exp = document.getElementById("experience");
    exp.innerHTML = "";
    data.experience.forEach((j, idx) => {
      const art = document.createElement("article");
      art.className = "job";
      art.dataset.id = idx + 1;
      art.innerHTML = `<h4 contenteditable>${j.title}</h4><div class="meta" contenteditable>${j.meta}</div><p contenteditable>${j.desc}</p>`;
      exp.appendChild(art);
    });
  }

  if (data.education)
    document.getElementById("education").innerText = data.education;
  if (Array.isArray(data.projects)) {
    const p = document.getElementById("projects");
    p.innerHTML = "";
    data.projects.forEach((t) => {
      const li = document.createElement("li");
      li.contentEditable = true;
      li.innerText = t;
      p.appendChild(li);
    });
  }
  if (Array.isArray(data.certs)) {
    const p = document.getElementById("certs");
    p.innerHTML = "";
    data.certs.forEach((t) => {
      const li = document.createElement("li");
      li.contentEditable = true;
      li.innerText = t;
      p.appendChild(li);
    });
  }

  // Avatar initials
  updateAvatar();
}

function updateAvatar() {
  const name = document.getElementById("fullName").innerText.trim();
  const avatar = document.getElementById("avatar");
  if (!name) return (avatar.innerText = "TA");
  const parts = name.split(" ").filter(Boolean);
  avatar.innerText =
    (parts[0] ? parts[0][0] : "T") + (parts[1] ? parts[1][0] : "A");
}

editBtn.addEventListener("click", () => toggleEdit());
saveBtn.addEventListener("click", () => {
  const data = gatherData();
  localStorage.setItem("resume_data_v1", JSON.stringify(data));
  alert("Saved locally. You can Export JSON to share or Print to PDF.");
  toggleEdit(false);
});
resetBtn.addEventListener("click", () => {
  if (
    confirm(
      "Reset resume to the original template? This will clear local saved data."
    )
  ) {
    localStorage.removeItem("resume_data_v1");
    location.reload();
  }
});
printBtn.addEventListener("click", () => {
  toggleEdit(false);
  window.print();
});

exportBtn.addEventListener("click", () => {
  const data = gatherData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    (document.getElementById("fullName").innerText || "resume").replace(
      /\s+/g,
      "_"
    ) + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", () => {
  const f = importFile.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      applyData(data);
      localStorage.setItem("resume_data_v1", JSON.stringify(data));
      alert("Imported successfully.");
    } catch (e) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(f);
});

// On load: restore from localStorage
window.addEventListener("DOMContentLoaded", () => {
  const raw = localStorage.getItem("resume_data_v1");
  if (raw) {
    try {
      applyData(JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to parse saved resume");
    }
  }
  updateAvatar();
  // Stop editing by default
  toggleEdit(false);
});

// small UX: update avatar when name changes while editing
document.getElementById("fullName").addEventListener("input", updateAvatar);
