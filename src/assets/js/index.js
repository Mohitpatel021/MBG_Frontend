document.addEventListener("DOMContentLoaded", function () {
  // Place your entire script inside this function
  // Handle active class for sidebar links
  const sideLinks = document.querySelectorAll(
    ".sidebar .side-menu li a:not(.logout)"
  );

  sideLinks.forEach((item) => {
    const li = item.parentElement;
    item.addEventListener("click", () => {
      sideLinks.forEach((i) => {
        i.parentElement.classList.remove("active");
      });
      li.classList.add("active");
    });
  });

  // Handle menu bar toggle
  const menuBar = document.querySelector(".content nav .bx.bx-menu");
  const sideBar = document.querySelector(".sidebar");

  if (menuBar && sideBar) {
    menuBar.addEventListener("click", () => {
      sideBar.classList.toggle("close");
    });
  }

  // Handle search button functionality
  const searchBtn = document.querySelector(
    ".content nav form .form-input button"
  );
  const searchBtnIcon = document.querySelector(
    ".content nav form .form-input button .bx"
  );
  const searchForm = document.querySelector(".content nav form");

  if (searchBtn && searchBtnIcon && searchForm) {
    searchBtn.addEventListener("click", function (e) {
      if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm.classList.toggle("show");
        if (searchForm.classList.contains("show")) {
          searchBtnIcon.classList.replace("bx-search", "bx-x");
        } else {
          searchBtnIcon.classList.replace("bx-x", "bx-search");
        }
      }
    });
  }

  // Handle window resize behavior
  window.addEventListener("resize", () => {
    if (window.innerWidth < 768) {
      sideBar.classList.add("close");
    } else {
      sideBar.classList.remove("close");
    }

    if (window.innerWidth > 576) {
      searchBtnIcon.classList.replace("bx-x", "bx-search");
      searchForm.classList.remove("show");
    }
  });

  // Handle theme toggle
  const toggler = document.getElementById("theme-toggle");

  if (toggler) {
    toggler.addEventListener("change", function () {
      if (this.checked) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    });
  }
});
