document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initContactFormValidation();
  initProjectsFetcher();
});

function initThemeToggle() {
  const header = document.querySelector("header");
  if (!header) return;

  const toggleBtn = document.createElement("button");
  toggleBtn.id = "theme-toggle";
  toggleBtn.className = "theme-toggle-btn";
  toggleBtn.setAttribute("aria-label", "Toggle dark and light mode");
  
  const savedTheme = localStorage.getItem("portfolio-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  const currentTheme = savedTheme || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateToggleIcon(toggleBtn, currentTheme);

  toggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = activeTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("portfolio-theme", newTheme);
    updateToggleIcon(toggleBtn, newTheme);
  });

  header.appendChild(toggleBtn);
}

function updateToggleIcon(button, theme) {
  button.innerHTML = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
}

async function initProjectsFetcher() {
  const projectsGrid = document.getElementById("github-projects-grid");
  if (!projectsGrid) return;

  projectsGrid.innerHTML = `<p class="loading-state" role="status">Fetching public repositories...</p>`;

  try {
    const response = await fetch("https://api.github.com/users/octocat/repos?per_page=4&sort=updated");
    if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);

    const repos = await response.json();
    renderGitHubProjects(repos, projectsGrid);
  } catch (error) {
    projectsGrid.innerHTML = `<div class="error-message" role="alert"><p>Unable to load external projects at this time.</p></div>`;
  }
}

function renderGitHubProjects(repos, container) {
  container.innerHTML = "";

  repos.forEach((repo) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const title = document.createElement("h3");
    title.textContent = repo.name;

    const description = document.createElement("p");
    description.textContent = repo.description || "No description provided for this repository.";

    const language = document.createElement("span");
    language.className = "badge";
    language.textContent = repo.language || "Web Project";

    const link = document.createElement("a");
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `View ${repo.name} project repository on GitHub`);
    link.textContent = "View Repository →";

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(language);
    card.appendChild(link);

    container.appendChild(card);
  });
}

function initContactFormValidation() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const inputs = form.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => clearError(input));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) isValid = false;
    });

    if (!isValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    setTimeout(() => {
      showFormStatus(form, "Message sent successfully! Thank you for reaching out.", "success");
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }, 1500);
  });
}

function validateField(input) {
  const errorElement = document.getElementById(`${input.id}-error`);
  let errorMessage = "";

  if (input.validity.valueMissing) {
    errorMessage = `${getLabelText(input)} is required.`;
  } else if (input.type === "email" && input.validity.typeMismatch) {
    errorMessage = "Please enter a valid email address.";
  }

  if (errorMessage) {
    input.setAttribute("aria-invalid", "true");
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = "block";
    }
    return false;
  }

  clearError(input);
  return true;
}

function clearError(input) {
  input.removeAttribute("aria-invalid");
  const errorElement = document.getElementById(`${input.id}-error`);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
}

function getLabelText(input) {
  const label = document.querySelector(`label[for="${input.id}"]`);
  return label ? label.textContent.replace(":", "").trim() : "This field";
}

function showFormStatus(form, message, type) {
  let statusBox = document.getElementById("form-status");
  if (!statusBox) {
    statusBox = document.createElement("div");
    statusBox.id = "form-status";
    statusBox.setAttribute("role", "alert");
    form.prepend(statusBox);
  }

  statusBox.className = `status-message ${type}`;
  statusBox.textContent = message;
}
