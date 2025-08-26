document.addEventListener("DOMContentLoaded", () => {

  const steps = document.querySelectorAll(".stp");
  const circleSteps = document.querySelectorAll(".form-sidebar .step");

  const formInputs = document.querySelectorAll(".step-1 form input");
  const plans = document.querySelectorAll(".step-2 .plan-card");
  const switcher = document.querySelector(".switch");
  const addons = document.querySelectorAll(".step-3 .box");

  const planNameBox = document.querySelector(".plan-name");
  const planPriceBox = document.querySelector(".selection-box .plan-price");
  const totalBox = document.querySelector(".total b");

  let currentStep = 1;  
  let currentCircle = 0;
  let time = false;     

  const obj = {
    plan: "Arcade",
    kind: "Monthly",
    price: "₹90/mo",
  };

  const selectedPlanCard = document.querySelector(".step-2 .plan-card.selected");
  if (selectedPlanCard) {
    const b = selectedPlanCard.querySelector("b");
    const sp = selectedPlanCard.querySelector(".plan-price");
    if (b && sp) {
      obj.plan = b.innerText;
      obj.price = sp.innerText;
    }
  }
  updateSummaryAndTotal();

  const step4 = document.querySelector(".step-4");
  const nextInStep4 = step4?.querySelector(".next-stp");
  if (nextInStep4) {
    nextInStep4.textContent = "Confirm";
    nextInStep4.classList.add("confirm-stp");
    nextInStep4.classList.remove("next-stp");
  }
  const confirmBtn = step4?.querySelector(".confirm-stp");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showStep(5);
    });
  }

  steps.forEach((stepEl) => {
    const prevBtn = stepEl.querySelector(".prev-stp");
    const nextBtn = stepEl.querySelector(".next-stp");
    if (prevBtn) prevBtn.addEventListener("click", gotoPrev);
    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentStep === 1 && !validateForm()) return;
        gotoNext();
      });
    }
  });

  function showStep(n) {
    document.querySelector(`.step-${currentStep}`).style.display = "none";
    currentStep = n;
    document.querySelector(`.step-${currentStep}`).style.display = "flex";

    if (currentStep >= 1 && currentStep <= 4) {
      circleSteps.forEach((c, i) => c.classList.toggle("active", i <= currentStep - 1));
      currentCircle = Math.min(currentStep - 1, circleSteps.length - 1);
    }
 
    if (currentStep === 4) updateSummaryAndTotal();
  }

  function gotoNext() {
    const next = Math.min(currentStep + 1, 5);
    showStep(next);
  }

  function gotoPrev() {
    const prev = Math.max(currentStep - 1, 1);
    showStep(prev);
  }

  function validateForm() {
    let valid = true;

    formInputs.forEach((input) => {
      const labelContainer = input.previousElementSibling;
      const errorMsg = labelContainer?.querySelector(".error");
      
      if (!input.checkValidity()) {
        valid = false;
        input.classList.add("errors");
        if (errorMsg) {
          errorMsg.textContent = input.validationMessage;
          errorMsg.style.display = "block";
        }
      } else {
        input.classList.remove("errors");
        if (errorMsg) errorMsg.style.display = "none";
      }
    });
    return valid;
  }

  plans.forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelector(".step-2 .plan-card.selected")?.classList.remove("selected");
      card.classList.add("selected");

      const name = card.querySelector("b")?.innerText ?? obj.plan;
      const priceText = card.querySelector(".plan-price")?.innerText ?? obj.price;

      obj.plan = name;
      obj.price = priceText;

      updateSummaryAndTotal();
    });
  });

  switcher?.addEventListener("click", () => {
    const checked = switcher.querySelector("input")?.checked ?? false;

    document.querySelector(".monthly")?.classList.toggle("sw-active", !checked);
    document.querySelector(".yearly")?.classList.toggle("sw-active", checked);

    obj.kind = checked ? "Yearly" : "Monthly";
    setTime(checked);
    switchPrice(checked);

  document.querySelectorAll(".plan-card .offer").forEach(offer => {
    offer.style.display = checked ? "block" : "none";
  });

    const activeCard = document.querySelector(".step-2 .plan-card.selected");
    if (activeCard) {
      const p = activeCard.querySelector(".plan-price")?.innerText;
      if (p) obj.price = p;
    }
    updateSummaryAndTotal();
  });

  addons.forEach((addon) => {
    addon.addEventListener("click", (e) => {
      e.preventDefault();
      const cb = addon.querySelector("input");
      const id = addon.dataset.id;
      if (cb.checked) {
        cb.checked = false;
        addon.classList.remove("ad-selected");
        showAddon(id, false);
      } else {
        cb.checked = true;
        addon.classList.add("ad-selected");
        showAddon(addon, true);
      }
      updateSummaryAndTotal();
    });
  });

  function updateSummaryAndTotal() {
    if (planNameBox) planNameBox.innerText = `${obj.plan} (${obj.kind || "Monthly"})`;
    if (planPriceBox) planPriceBox.innerText = obj.price;
    setTotal();
  }

  function switchPrice(checked) {
    const yearlyPrice = [90, 120, 150];
    const monthlyPrice = [9, 12, 15];
    const prices = document.querySelectorAll(".step-2 .plan-price");
    const list = checked ? yearlyPrice : monthlyPrice;
    prices.forEach((el, i) => {
      if (list[i] != null) el.innerText = `₹${list[i]}/${checked ? "yr" : "mo"}`;
    });
  }

  function showAddon(ad, addIt) {
    const temp = document.querySelector(".addons template");
    if (!temp) return;

    if (addIt) {
      const clone = temp.content.cloneNode(true);
      const service = clone.querySelector(".service-name");
      const price = clone.querySelector(".service-price");
      const row = clone.querySelector(".selected-addon");
      service.innerText = ad.querySelector("label").innerText;
      price.innerText = ad.querySelector(".price").innerText;
      row.setAttribute("data-id", ad.dataset.id);
      document.querySelector(".addons").appendChild(clone);
    } else {
      document.querySelectorAll(".selected-addon").forEach((row) => {
        if (row.getAttribute("data-id") === String(ad)) row.remove();
      });
    }
  }

  function setTotal() {
    const planStr = planPriceBox?.innerText || "₹0/mo";
    const base = Number(planStr.replace(/\D/g, "")) || 0;

    let addonSum = 0;
    document.querySelectorAll(".selected-addon .service-price").forEach((p) => {
      addonSum += Number(p.innerText.replace(/\D/g, "")) || 0;
    });

    const total = base + addonSum;
    if (totalBox) totalBox.innerText = `₹${total}/${time ? "yr" : "mo"}`;
  }

  function setTime(t) {
    time = !!t;
  }
});
