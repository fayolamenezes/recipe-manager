console.log("Main JS loaded");

document.addEventListener("DOMContentLoaded", () => {
  const o = document.querySelector(".cta-button");
  if (o) {
    o.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});
