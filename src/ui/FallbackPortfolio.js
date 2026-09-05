export function showFallback(message) {
  document.body.classList.add("list-mode");
  document.querySelector("#list-view").hidden = false;
  document.querySelector("#view-toggle").textContent = "List view";
  document.querySelector("#view-toggle").disabled = true;
  document.querySelector("#motion-toggle").hidden = true;
  document.querySelector("#universe").hidden = true;
  document.querySelector("#labels").hidden = true;
  document.querySelector(".list-heading>p:last-child").textContent = message;
}
