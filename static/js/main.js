let timer;
let duration = 100;
const burgerBtn = document.getElementById("burger");
const navLinks = document.getElementById("links");
const patientContainer = document.querySelector("#patient-profiles .body");
const appointmentContainer = document.querySelector(
  "#appointment-profiles .body"
);
const transactionContainer = document.querySelector(
  "#transactions-profile .body"
);
const trialBalanceContainer = document.querySelector(
  "#trial-balance-profile .body"
);
const trialBalanceCurrencyContainer = document.querySelector(
  "#trial-balance-currency-profile .body"
);
const exchangeContainer = document.querySelector("#exchange-profile .body");
const [todayRadio, upcomingRadio, allRadio] = document.querySelectorAll(
  "#appointment-radio > input"
);
const brand = document.querySelector("nav .brand h1");
const patientLedger = document.getElementById("ledger");
const patientLedgerCloseBtn = document.querySelector("#ledger .x-btn");
const patientLedgerRefreshBtn = document.querySelector("#ledger .refresh");

class Form {
  /**
   *
   * @param {string} showBtnID
   * @param {string} formID
   * @param {string} closeBtnID
   * @param {string} saveBtnID
   */
  constructor(showBtnID, formID, closeBtnID, saveBtnID) {
    this.showBtn = document.getElementById(showBtnID);
    this.form = document.getElementById(formID);
    this.closeBtn = document.getElementById(closeBtnID);
    this.saveBtn = document.getElementById(saveBtnID);
  }
  fillDateTime(container, type) {
    if (type === "date") {
      container.querySelectorAll("input[type=date]").forEach((dateInput) => {
        let dateNow = new Date();
        let month = String(dateNow.getMonth() + 1).padStart(2, 0);
        let day = String(dateNow.getDate()).padStart(2, 0);
        dateNow = `${dateNow.getFullYear()}-${month}-${day}`;
        dateInput.value = dateNow;
      });
    } else {
      container.querySelectorAll("input[type=time]").forEach((timeInput) => {
        let timeNow = new Date();
        let hours = String(timeNow.getHours()).padStart(2, 0);
        let minutes = String(timeNow.getMinutes()).padStart(2, 0);
        timeInput.value = `${hours}:${minutes}`;
      });
    }
  }
  openFormMethod() {
    this.form.classList.remove("closed");
  }
  openForm() {
    this.showBtn.addEventListener("click", () => {
      this.form.classList.remove("closed");
      this.fillDateTime(this.form, "date");
      this.fillDateTime(this.form, "time");
    });
  }
  closeForm() {
    this.closeBtn.addEventListener("click", () => {
      this.form.classList.add("closed");
      this.form.setAttribute("data-form-id", "");
      this.form.querySelectorAll("input").forEach((ele) => {
        ele.value = "";
      });
    });
  }
  changeChecking(func) {
    this.form.querySelectorAll("input,select,textarea").forEach((input) => {
      input.addEventListener("change", func.bind(this));
    });
  }
  inputValidation(element, event, type) {
    element.addEventListener(event, () => {
      this.inputPending(element);
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.isValid(element, "", type);
      }, 1000);
    });
  }
  /**
   *
   * @param {HTMLElement} element
   */
  inputPending(element) {
    element.nextElementSibling.setAttribute("data-status", "pending");
  }
  /**
   *
   * @param {HTMLElement} input
   */
  isValid(input, action = "", type) {
    let criteria = false;
    switch (type) {
      case "phone":
        criteria = /^09[3-9]\d{7}$/g.test(input.value);
        break;
      case "name":
        criteria = input.value.trim() || false;
        break;
      case "date":
        criteria = /\d{4}\-[0-1]\d\-[0-3]\d/g.test(input.value);
        break;
      case "number":
        criteria = input.value || false;
        break;
      case "time":
        criteria = /[0-2]\d\:[0-5]\d/g.test(input.value);
        break;
    }
    if (!action) {
      if (criteria) {
        input.nextElementSibling.setAttribute("data-status", "success");
        input.nextElementSibling.innerHTML = "valid";
      } else {
        input.nextElementSibling.setAttribute("data-status", "warning");
        input.nextElementSibling.innerHTML = "Not Valid";
      }
    }
    return criteria;
  }
}

class PatientForm extends Form {
  constructor(
    showBtnID,
    formID,
    closeBtnID,
    saveBtnID,
    nameInputID,
    phoneInputID,
    birthInputID
  ) {
    super(showBtnID, formID, closeBtnID, saveBtnID);
    this.nameInput = document.getElementById(nameInputID);
    this.phoneInput = document.getElementById(phoneInputID);
    this.birthInput = document.getElementById(birthInputID);
  }
  checkForm() {
    let criteria =
      super.isValid(this.nameInput, "check", "name") &&
      super.isValid(this.birthInput, "check", "date") &&
      super.isValid(this.phoneInput, "check", "phone");
    if (criteria) {
      this.saveBtn.classList.remove("dimmed");
    } else {
      this.saveBtn.classList.add("dimmed");
    }
    return criteria;
  }
  saveData() {
    this.saveBtn.addEventListener("click", () => {
      if (this.checkForm()) {
        let data = new Map();
        data.set("id", this.form.getAttribute("data-form-id"));
        this.form.querySelectorAll("input,select").forEach((input) => {
          data.set(input.getAttribute("id"), input.value);
        });
        this.nameInput.value = "";
        this.inputPending(this.nameInput);
        this.birthInput.value = "";
        this.inputPending(this.birthInput);
        this.phoneInput.value = "";
        this.inputPending(this.phoneInput);
        data = Object.fromEntries(data);
        alert(`${data["name"]} has been added.`);
        this.form.classList.add("closed");
        sendData("patient", data);
        setTimeout(updateAll, duration);
        this.form.setAttribute("data-form-id", "");
      }
    });
  }
}

class AppointmentForm extends Form {
  constructor(
    showBtnID,
    formID,
    closeBtnID,
    saveBtnID,
    namesInputID,
    dateInputID,
    timeInputID
  ) {
    super(showBtnID, formID, closeBtnID, saveBtnID);
    this.namesInput = document.getElementById(namesInputID);
    this.dateInput = document.getElementById(dateInputID);
    this.timeInput = document.getElementById(timeInputID);
  }
  checkForm() {
    let criteria =
      this.isValid(this.dateInput, "check", "date") &&
      this.isValid(this.timeInput, "check", "time");
    if (criteria) {
      this.saveBtn.classList.remove("dimmed");
    } else {
      this.saveBtn.classList.add("dimmed");
    }
    return criteria;
  }
  saveData() {
    this.saveBtn.addEventListener("click", () => {
      if (this.checkForm()) {
        let data = new Map();
        data.set("id", this.form.getAttribute("data-form-id"));
        this.form.querySelectorAll("select,input").forEach((ele) => {
          data.set(ele.getAttribute("id"), ele.value);
        });
        this.timeInput.value = "";
        this.inputPending(this.timeInput);
        this.dateInput.value = "";
        this.inputPending(this.dateInput);
        data = Object.fromEntries(data);
        alert(`a new Appointment has been added.`);
        this.form.classList.add("closed");
        sendData("appointment", data);
        setTimeout(updateAll, duration);
        this.form.setAttribute("data-form-id", "");
      }
    });
  }
  openForm() {
    this.showBtn.addEventListener("click", () => {
      this.form.classList.remove("closed");
      super.fillDateTime(this.form, "date");
      super.fillDateTime(this.form, "time");
      getData("patient").then((data) => {
        this.namesInput.innerHTML = "";
        data.forEach((patient) => {
          let element = createEl("option", patient[1], ["value", patient[0]]);
          this.namesInput.appendChild(element);
        });
      });
    });
  }
}

class CaseFrom extends Form {
  constructor(showBtnID, formID, closeBtnID, saveBtnID, caseTitleID) {
    super(showBtnID, formID, closeBtnID, saveBtnID);
    this.caseTitle = document.getElementById(caseTitleID);
  }
  checkForm() {
    let criteria = this.isValid(this.caseTitle, "check", "name");
    if (criteria) {
      this.saveBtn.classList.remove("dimmed");
    } else {
      this.saveBtn.classList.add("dimmed");
    }
    return criteria;
  }
  saveData() {
    this.saveBtn.addEventListener("click", () => {
      if (this.checkForm()) {
        let data = new Map();
        data.set("id", this.form.getAttribute("data-form-id"));
        this.form.querySelectorAll("select,input").forEach((ele) => {
          data.set(ele.getAttribute("id"), ele.value);
        });
        this.caseTitle.value = "";
        this.inputPending(this.caseTitle);
        data = Object.fromEntries(data);
        alert(`a new Case has been added.`);
        this.form.classList.add("closed");
        sendData("cases", data);
        setTimeout(updateAll, duration);
        this.form.setAttribute("data-form-id", "");
      }
    });
  }
  openForm() {
    this.showBtn.addEventListener("click", () => {
      this.form.classList.remove("closed");
      getData("cases").then((data) => {
        this.caseTitle.innerHTML = "";
        data.forEach((cse) => {
          let element = createEl("option", cse[1], ["value", cse[0]]);
          this.caseTitle.appendChild(element);
        });
      });
    });
  }
}

class TransactionForm extends Form {
  constructor(
    showBtnID,
    formID,
    closeBtnID,
    saveBtnID,
    patientNameID,
    caseTitleID,
    dateTransactionID,
    timeTransactionID,
    amountTransactionID,
    rateTransactionID,
    amountTypeTransactionID,
    notesTransactionID
  ) {
    super(showBtnID, formID, closeBtnID, saveBtnID);
    this.patientName = document.getElementById(patientNameID);
    this.caseTitle = document.getElementById(caseTitleID);
    this.dateTransaction = document.getElementById(dateTransactionID);
    this.timeTransaction = document.getElementById(timeTransactionID);
    this.amountTransaction = document.getElementById(amountTransactionID);
    this.rateTransaction = document.getElementById(rateTransactionID);
    this.amountTypeTransaction = document.getElementById(
      amountTypeTransactionID
    );
    this.notesTransaction = document.getElementById(notesTransactionID);
  }
  checkForm() {
    let criteria =
      this.isValid(this.dateTransaction, "check", "date") &&
      this.isValid(this.timeTransaction, "check", "time") &&
      this.isValid(this.amountTransaction, "check", "number") &&
      this.isValid(this.rateTransaction, "check", "number") &&
      this.isValid(this.notesTransaction, "check", "name");
    if (criteria) {
      this.saveBtn.classList.remove("dimmed");
    } else {
      this.saveBtn.classList.add("dimmed");
    }
    return criteria;
  }
  saveData() {
    this.saveBtn.addEventListener("click", () => {
      if (this.checkForm()) {
        let data = new Map();
        data.set("id", this.form.getAttribute("data-form-id"));
        this.form.querySelectorAll("select,input,textarea").forEach((ele) => {
          data.set(ele.getAttribute("id"), ele.value);
        });
        this.dateTransaction.innerHTML = "";
        this.inputPending(this.dateTransaction);
        //------
        this.timeTransaction.innerHTML = "";
        this.inputPending(this.timeTransaction);
        //------
        this.amountTransaction.innerHTML = "";
        this.inputPending(this.amountTransaction);
        //------
        this.rateTransaction.innerHTML = "";
        this.inputPending(this.rateTransaction);
        //------
        this.notesTransaction.innerHTML = "";
        this.inputPending(this.notesTransaction);
        //------
        data = Object.fromEntries(data);
        alert(`a new Transaction has been added.`);
        this.form.classList.add("closed");
        sendData("transactions", data);
        setTimeout(updateAll, duration * 2);
        this.form.setAttribute("data-form-id", "");
      }
    });
  }
  openForm() {
    this.showBtn.addEventListener("click", () => {
      this.form.classList.remove("closed");
      getData("patient").then((data) => {
        this.patientName.innerHTML = "";
        data.forEach((cse) => {
          let element = createEl("option", cse[1], ["value", cse[0]]);
          this.patientName.appendChild(element);
        });
      });
      getData("cases").then((data) => {
        this.caseTitle.innerHTML = "";
        data.forEach((cse) => {
          let element = createEl("option", cse[1], ["value", cse[0]]);
          this.caseTitle.appendChild(element);
        });
      });
      super.fillDateTime(this.form, "date");
      super.fillDateTime(this.form, "time");
      this.amountTransaction.value = 10000;
      this.rateTransaction.value = 20000;
      this.notesTransaction.value = "";
      getData("dollar").then((data) => {
        let price = JSON.parse(data)["response"];
        this.rateTransaction.value = price;
      });
    });
  }
}

updateAll();
allRadio.setAttribute("checked", "");

patientLedgerCloseBtn.addEventListener("click", () => {
  patientLedger.classList.add("closed");
  patientLedger.setAttribute("data-patient-id", "");
  patientLedger.querySelector(".heading").setAttribute("data-patient-id", "");
  updateAll();
});
patientLedgerRefreshBtn.addEventListener("click", () => {
  id = patientLedger.querySelector(".heading").getAttribute("data-patient-id");
  loadLedger(+id);
});

let newPatientForm = new PatientForm(
  "add-new-patient",
  "add-patient-form",
  "add-patient-close-btn",
  "add-patient-save-btn",
  "name",
  "phone",
  "birth"
);

newPatientForm.openForm();
newPatientForm.closeForm();
newPatientForm.inputValidation(newPatientForm.nameInput, "keyup", "name");
newPatientForm.inputValidation(newPatientForm.birthInput, "change", "date");
newPatientForm.inputValidation(newPatientForm.phoneInput, "keyup", "phone");
newPatientForm.changeChecking(newPatientForm.checkForm);
newPatientForm.saveData();

let newAppointmentForm = new AppointmentForm(
  "add-new-appointment",
  "add-appointment-form",
  "add-appointment-close-btn",
  "add-appointment-save-btn",
  "names-appointment",
  "appointment-date",
  "appointment-time"
);
newAppointmentForm.changeChecking(newAppointmentForm.checkForm);
newAppointmentForm.saveData();
newAppointmentForm.openForm();
newAppointmentForm.closeForm();
newAppointmentForm.inputValidation(
  newAppointmentForm.dateInput,
  "change",
  "date"
);
newAppointmentForm.inputValidation(
  newAppointmentForm.timeInput,
  "change",
  "time"
);

let newCaseForm = new CaseFrom(
  "add-new-case",
  "add-case-form",
  "add-case-close-btn",
  "add-case-save-btn",
  "case-title"
);
newCaseForm.changeChecking(newCaseForm.checkForm);
newCaseForm.saveData();
newCaseForm.openForm();
newCaseForm.closeForm();
newCaseForm.inputValidation(newCaseForm.caseTitle, "keyup", "name");

let newTransactionForm = new TransactionForm(
  "add-new-transaction",
  "add-transaction-form",
  "add-transaction-close-btn",
  "add-transaction-save-btn",
  "patients-transactions",
  "cases-transactions",
  "transaction-date",
  "transaction-time",
  "transaction-amount",
  "transaction-rate",
  "amount-type-transactions",
  "transaction-notes"
);

newTransactionForm.openForm();
newTransactionForm.closeForm();
newTransactionForm.inputValidation(
  newTransactionForm.dateTransaction,
  "change",
  "date"
);
newTransactionForm.inputValidation(
  newTransactionForm.timeTransaction,
  "change",
  "time"
);
newTransactionForm.inputValidation(
  newTransactionForm.amountTransaction,
  "keyup",
  "number"
);
newTransactionForm.inputValidation(
  newTransactionForm.rateTransaction,
  "keyup",
  "number"
);
newTransactionForm.inputValidation(
  newTransactionForm.notesTransaction,
  "keyup",
  "name"
);
newTransactionForm.changeChecking(newTransactionForm.checkForm);
newTransactionForm.saveData();

burgerBtn.addEventListener("click", () => {
  navLinks.classList.toggle("close");
  burgerBtn.classList.toggle("close");
});

function closeNavbar() {
  navLinks.classList.remove("close");
  burgerBtn.classList.remove("close");
}

function updatePrice() {
  getData("/dollar").then((data) => {
    let price = JSON.parse(data)["response"];
    brand.setAttribute("title", price.toLocaleString());
  });
}

function updateAll() {
  getAllPatients();
  getAppointments();
  getTrialBalance();
  getTrialBalanceCurrency();
  getLastTransactions();
}

function getTrialBalance() {
  getLedger("")
    .then((response) => response.json())
    .then((data) => {
      data = JSON.parse(data)["result"];
      trialBalanceContainer.innerHTML = "";
      trialBalanceContainer.previousElementSibling.querySelector(
        "h3 span"
      ).innerHTML = "";
      let trialBalance = new Map();
      for (let r of data) {
        let [
          transactionID,
          patientID,
          patientName,
          caseID,
          caseTitle,
          transactionDate,
          transactionTime,
          amount,
          rate,
          amountType,
          notes,
        ] = r;
        let debit = amountType === "1" ? amount : 0;
        let credit = amountType === "2" ? amount : 0;
        if (trialBalance.has(patientName)) {
          trialBalance.set(patientName, [
            trialBalance.get(patientName)[0] + debit,
            trialBalance.get(patientName)[1] + credit,
          ]);
        } else {
          trialBalance.set(patientName, [debit, credit]);
        }
      }
      trialBalance = Array.from(trialBalance)
        .map((ele) => [ele[0], ...ele[1], ele[1][0] - ele[1][1]])
        .filter((ele) => ele[3]);

      let total = trialBalance.reduce((acc, a) => acc + a[3], 0);

      trialBalanceContainer.previousElementSibling.querySelector(
        "h3 span"
      ).innerHTML = `(${total.toLocaleString()})`;

      for (let r of trialBalance) {
        let [name, debitTotal, creditTotal, net] = r;
        let nameSpan = createEl("span", name);
        let debitTotalSpan = createEl("span", debitTotal.toLocaleString());
        let creditTotalSpan = createEl("span", creditTotal.toLocaleString());
        let netSpan = createEl("span", net.toLocaleString());
        let row = createEl("div", "", ["class", "row"]);
        row.appendChild(nameSpan);
        row.appendChild(debitTotalSpan);
        row.appendChild(creditTotalSpan);
        row.appendChild(netSpan);
        trialBalanceContainer.append(row);
      }
    });
}

function getTrialBalanceCurrency() {
  getLedger("")
    .then((response) => response.json())
    .then((data) => {
      data = JSON.parse(data)["result"];
      trialBalanceCurrencyContainer.innerHTML = "";
      trialBalanceCurrencyContainer.previousElementSibling.querySelector(
        "h3 span"
      ).innerHTML = "";
      let trialBalance = new Map();
      for (let r of data) {
        let [
          transactionID,
          patientID,
          patientName,
          caseID,
          caseTitle,
          transactionDate,
          transactionTime,
          amount,
          rate,
          amountType,
          notes,
        ] = r;
        let debit =
          amountType === "1" ? Math.floor((amount / rate) * 100) / 100 : 0;
        let credit =
          amountType === "2" ? Math.floor((amount / rate) * 100) / 100 : 0;
        if (trialBalance.has(patientName)) {
          trialBalance.set(patientName, [
            trialBalance.get(patientName)[0] + debit,
            trialBalance.get(patientName)[1] + credit,
          ]);
        } else {
          trialBalance.set(patientName, [debit, credit]);
        }
      }
      trialBalance = Array.from(trialBalance)
        .map((ele) => [ele[0], ...ele[1], ele[1][0] - ele[1][1]])
        .filter((ele) => ele[3]);

      let total = trialBalance.reduce((acc, a) => acc + a[3], 0);

      trialBalanceCurrencyContainer.previousElementSibling.querySelector(
        "h3 span"
      ).innerHTML = `(${total.toLocaleString()})`;

      for (let r of trialBalance) {
        let [name, debitTotal, creditTotal, net] = r;
        let nameSpan = createEl("span", name);
        let debitTotalSpan = createEl("span", debitTotal.toLocaleString());
        let creditTotalSpan = createEl("span", creditTotal.toLocaleString());
        let netSpan = createEl("span", net.toLocaleString());
        let row = createEl("div", "", ["class", "row"]);
        row.appendChild(nameSpan);
        row.appendChild(debitTotalSpan);
        row.appendChild(creditTotalSpan);
        row.appendChild(netSpan);
        trialBalanceCurrencyContainer.append(row);
      }
    });
}

function getLastTransactions() {
  getLedger("")
    .then((response) => response.json())
    .then((data) => {
      data = JSON.parse(data)["result"];
      transactionContainer.innerHTML = "";
      if (data.length) {
        data.length = Math.min(10, data.length);
        for (let r of data) {
          let [
            transactionID,
            patientID,
            patientName,
            caseID,
            caseTitle,
            transactionDate,
            transactionTime,
            amount,
            rate,
            amountType,
            notes,
          ] = r;
          let row = createEl("div", "", ["class", "row"]);
          let nameSpan = createEl("span", transactionID + " - " + patientName);
          let caseTitleSpan = createEl("span", caseTitle);
          let transactionDateSpan = createEl(
            "span",
            transactionDate + " " + transactionTime
          );
          let amountSpan = createEl(
            "span",
            amountType === "1"
              ? amount.toLocaleString()
              : (-amount).toLocaleString()
          );
          row.appendChild(nameSpan);
          row.appendChild(caseTitleSpan);
          row.appendChild(transactionDateSpan);
          row.appendChild(amountSpan);
          transactionContainer.appendChild(row);
        }
      }
    });
}

function getAllPatients() {
  getData("patient").then((data) => {
    patientContainer.innerHTML = "";
    patientContainer.previousElementSibling.querySelector(
      "h3 span"
    ).innerHTML = `(${data.length})`;
    for (let r of data) {
      let [id, name, birth, phone, gender] = r;
      let row = createEl(
        "div",
        "",
        ["class", "row"],
        ["data-id", id],
        ["data-name", name],
        ["data-birth", birth],
        ["data-phone", phone],
        ["data-gender", gender]
      );

      getLedger(id)
        .then((response) => response.json())
        .then((data) => {
          let net = 0;
          data = JSON.parse(data)["result"];
          for (let xx of data) {
            if (xx[9] === "1") {
              net += xx[7];
            } else {
              net += -xx[7];
            }
          }
          row.setAttribute("title", net.toLocaleString());
        });

      let age = new Date(birth);
      age = new Date() - age;
      age = Math.floor(age / 1000 / 3600 / 24 / 365);
      let nameSpan = createEl("span", name);
      let birthSpan = createEl("span", age + " Year");
      let phoneSpan = createEl("span", "");
      let phoneAnchor = createEl("a", phone, [
        "href",
        `tel:+963${phone.slice(1)}`,
      ]);
      phoneSpan.appendChild(phoneAnchor);
      let btns = createEl("div", "", ["class", "btns"]);

      let whatsappSpan = createEl("span", "");
      whatsappSpan = addClasses(whatsappSpan, "btn", "p-btn");
      let whatsappAnchor = createEl(
        "a",
        "",
        ["href", `https://web.whatsapp.com/send?phone=+963${phone.slice(1)}`],
        ["target", "_blank"],
        ["title", "Whatsapp " + name]
      );
      let whatsappIcon = createEl("i", "");
      whatsappIcon = addClasses(whatsappIcon, "bi", "bi-whatsapp");
      whatsappAnchor.appendChild(whatsappIcon);
      whatsappSpan.appendChild(whatsappAnchor);

      let editSpan = createEl("span", "");
      editSpan = addClasses(editSpan, "btn", "acnt-btn");
      let editIcon = createEl("i", "", ["title", "edit " + name]);
      editIcon = addClasses(editIcon, "bi", "bi-pencil-square");

      editIcon.addEventListener("click", () => {
        newPatientForm.form.setAttribute("data-form-id", id);
        newPatientForm.nameInput.value = name;
        newPatientForm.birthInput.value = birth;
        newPatientForm.phoneInput.value = phone;
        newPatientForm.form.querySelector("select").value = gender;
        newPatientForm.openFormMethod();
      });

      editSpan.appendChild(editIcon);

      let logSpan = createEl("span", "");
      logSpan = addClasses(logSpan, "btn", "acnt-btn");
      let logIcon = createEl("i", "", ["title", "log " + name]);
      logIcon = addClasses(logIcon, "bi", "bi-clock-history");

      logIcon.addEventListener("click", () => {
        patientLedger.classList.remove("closed");
        patientLedger.setAttribute("data-patient-id", id);
        patientLedger
          .querySelector(".heading")
          .setAttribute("data-patient-id", id);
        loadLedger(id);
      });

      logSpan.appendChild(logIcon);

      btns.appendChild(whatsappSpan);
      btns.appendChild(editSpan);
      btns.appendChild(logSpan);

      row.appendChild(nameSpan);
      row.appendChild(birthSpan);
      row.appendChild(phoneSpan);
      row.appendChild(btns);
      patientContainer.appendChild(row);
    }
  });
}

function loadLedger(id) {
  let net = 0;
  let netCurrency = 0;
  getLedger(id)
    .then((response) => response.json())
    .then((data) => {
      if (data.length) {
        data = JSON.parse(data)["result"];
        let patientLedgerContainer =
          patientLedger.querySelector(".ledger-container");
        let patientLedgerHeading =
          patientLedger.querySelector(".ledger .heading");
        patientLedgerContainer.innerHTML = "";
        patientLedgerHeading.innerHTML =
          data.length !== 0 ? data[0][2] : "There is no Transactions";
        for (let r of data) {
          let [
            transactionID,
            patientID,
            patientName,
            caseID,
            caseTitle,
            transactionDate,
            transactionTime,
            amount,
            rate,
            amountType,
            notes,
          ] = r;
          let row = createEl(
            "div",
            "",
            ["class", "row"],
            ["data-transaction-id", transactionID],
            ["data-patient-id", patientID],
            ["data-patient-name", patientName],
            ["data-case-id", caseID],
            ["data-case-title", caseTitle],
            ["data-transaction-date", transactionDate],
            ["data-transaction-time", transactionTime],
            ["data-transaction-amount", amount],
            ["data-transaction-rate", rate],
            ["data-transaction-amount-type", amountType]
          );
          let caseTitleSpan = createEl("span", caseTitle, [
            "data-case-title",
            caseTitle,
          ]);
          let transactionDateSpan = createEl(
            "span",
            transactionDate + " " + transactionTime
          );

          let amountValue = amountType === "1" ? amount : -amount;
          let amountCurrency =
            amountType === "1"
              ? Math.round((amount / rate) * 100) / 100
              : -Math.round((amount / rate) * 100) / 100;
          net += amountValue;
          netCurrency += amountCurrency;

          let amountSpan = createEl("span", amountValue.toLocaleString());
          let amountCurrencySpan = createEl(
            "span",
            amountCurrency.toLocaleString()
          );

          if (amountValue > 0) {
            amountSpan.style.cssText = "color:red;";
            amountCurrencySpan.style.cssText = "color:red;";
          } else {
            amountSpan.style.cssText = "color:lime;";
            amountCurrencySpan.style.cssText = "color:lime;";
          }

          let netSpan = createEl("span", net.toLocaleString());
          if (net > 0) {
            netSpan.style.cssText = "color:red;background:var(--clr-p-600);";
          } else {
            netSpan.style.cssText = "color:lime;background:var(--clr-p-600);";
          }

          let netCurrencySpan = createEl("span", netCurrency.toLocaleString());
          if (netCurrency > 0) {
            netCurrencySpan.style.cssText =
              "color:red;background:var(--clr-p-600);";
          } else {
            netCurrencySpan.style.cssText =
              "color:lime;background:var(--clr-p-600)";
          }

          let noteSpan = createEl("span", notes);

          let dots = createEl("div", "", ["class", "dots-icon"]);
          let dotsList = createEl("ul", "", ["class", "dots-list"]);
          let dotsListEditLi = createEl("li", "");

          dotsListEditLi.addEventListener("click", () => {
            newTransactionForm.form.setAttribute("data-form-id", transactionID);
            getData("patient").then((data) => {
              newTransactionForm.patientName.innerHTML = "";
              for (let r of data) {
                let option = createEl("option", r[1], ["value", r[0]]);
                newTransactionForm.patientName.appendChild(option);
              }
              newTransactionForm.patientName.value = patientID;
            });
            getData("cases").then((data) => {
              newTransactionForm.caseTitle.innerHTML = "";
              for (let r of data) {
                let option = createEl("option", r[1], ["value", r[0]]);
                newTransactionForm.caseTitle.appendChild(option);
              }
              newTransactionForm.caseTitle.value = caseID;
            });
            newTransactionForm.dateTransaction.value = transactionDate;
            newTransactionForm.timeTransaction.value = transactionTime;
            newTransactionForm.amountTransaction.value = amount;
            newTransactionForm.rateTransaction.value = rate;
            newTransactionForm.amountTypeTransaction.value = amountType;
            newTransactionForm.notesTransaction.value = notes;

            newTransactionForm.openFormMethod();
          });

          let dotsListEditLiI = createEl("i", "");
          dotsListEditLiI = addClasses(dotsListEditLiI, "bi", "bi-pencil");
          let dotsListDeleteLi = createEl("li", "");

          dotsListDeleteLi.addEventListener("click", () => {
            sendData("transactions", transactionID, "DELETE");
            setTimeout(() => {
              loadLedger(patientID);
            }, duration);
          });

          let dotsListDeleteLiI = createEl("i", "");
          dotsListDeleteLiI = addClasses(dotsListDeleteLiI, "bi", "bi-trash");
          dotsListEditLi.appendChild(dotsListEditLiI);
          dotsListEditLi.appendChild(document.createTextNode("Edit"));
          dotsListDeleteLi.appendChild(dotsListDeleteLiI);
          dotsListDeleteLi.appendChild(document.createTextNode("Delete"));
          dotsList.appendChild(dotsListEditLi);
          dotsList.appendChild(dotsListDeleteLi);
          dots.appendChild(dotsList);

          row.appendChild(caseTitleSpan);
          row.appendChild(noteSpan);
          row.appendChild(transactionDateSpan);
          row.appendChild(amountSpan);
          row.appendChild(netSpan);
          row.appendChild(amountCurrencySpan);
          row.appendChild(netCurrencySpan);
          row.appendChild(dots);
          patientLedgerContainer.appendChild(row);
        }
      }
    });
}

function getLedger(id) {
  return fetch("transactions", {
    method: "PUT",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ result: id }),
  });
}

function getAppointments() {
  getData("appointment").then((data) => {
    appointmentContainer.innerHTML = "";
    for (let r of data) {
      let [
        appointmentId,
        patientId,
        patientName,
        appointmentDate,
        appointmentTime,
      ] = r;
      let row = createEl(
        "div",
        "",
        ["class", "row"],
        ["data-appointment-id", appointmentId],
        ["data-patient-id", patientId],
        ["data-patient-name", patientName],
        ["data-appointment-date", appointmentDate],
        ["data-appointment-time", appointmentTime],
        ["title", patientName]
      );
      let patientSpan = createEl("span", patientName);
      let patientDateSpan = createEl("span", appointmentDate);
      let patientTimeSpan = createEl("span", appointmentTime);
      let btns = createEl("div", "", ["class", "btns"]);

      let deleteBtn = createEl("span", "", ["title", "delete " + patientName]);
      deleteBtn = addClasses(deleteBtn, "btn", "acnt-btn");
      let deleteBtnIcon = createEl("i", "");
      deleteBtnIcon = addClasses(deleteBtnIcon, "bi", "bi-trash");

      deleteBtnIcon.addEventListener("click", () => {
        sendData("appointment", appointmentId, "DELETE");
        getAppointments();
      });

      let editBtn = createEl("span", "", [
        "title",
        "Edit Appointment " + patientName,
      ]);
      editBtn = addClasses(editBtn, "btn", "p-btn");
      let editBtnIcon = createEl("i", "");
      editBtnIcon = addClasses(editBtnIcon, "bi", "bi-pencil-square");

      editBtnIcon.addEventListener("click", () => {
        newAppointmentForm.form.setAttribute("data-form-id", appointmentId);
        newAppointmentForm.dateInput.value = appointmentDate;
        newAppointmentForm.timeInput.value = appointmentTime;
        newAppointmentForm.openFormMethod();
        getData("patient").then((data) => {
          newAppointmentForm.namesInput.innerHTML = "";
          data.forEach((patient) => {
            let element = createEl("option", patient[1], ["value", patient[0]]);
            newAppointmentForm.namesInput.appendChild(element);
          });
        });
        setTimeout(() => {
          newAppointmentForm.namesInput.value = patientId;
        }, duration);
      });

      let today = new Date();
      today = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}`;

      todayRadio.addEventListener("change", () => {
        row.classList.add("hide");
        if (today === appointmentDate) row.classList.remove("hide");
      });
      upcomingRadio.addEventListener("change", () => {
        row.classList.add("hide");
        if (new Date(today) <= new Date(appointmentDate))
          row.classList.remove("hide");
      });
      allRadio.addEventListener("change", () => {
        row.classList.remove("hide");
      });

      editBtn.appendChild(editBtnIcon);
      btns.appendChild(editBtn);

      deleteBtn.appendChild(deleteBtnIcon);
      btns.appendChild(deleteBtn);

      row.appendChild(patientSpan);
      row.appendChild(patientDateSpan);
      row.appendChild(patientTimeSpan);
      row.appendChild(btns);
      appointmentContainer.appendChild(row);
    }
  });
}

/**
 * add a list of classes to an HTML element
 * @param {HTMLElement} el - the html element
 * @param  {...string} classes - the list of classes to add
 * @returns {HTMLElement}
 */
function addClasses(el, ...classes) {
  el.classList.add(...classes);
  return el;
}

/**
 * Create an Element Node with its attributes
 * @param {string} el - HTML Tag
 * @param {string} textNode - Text Node
 * @param  {...string} attributes - list of the attributes [[att,val],[att,val]]
 * @returns {HTMLElement}
 */
function createEl(el = "div", textNode = "", ...attributes) {
  let element = document.createElement(el);
  if (attributes.length) {
    for (let attribute of attributes) {
      element.setAttribute(attribute[0], attribute[1]);
    }
  }
  if (textNode !== "") {
    let tn = document.createTextNode(textNode);
    element.appendChild(tn);
  }
  return element;
}

function sendData(apiLink, data, method = "POST") {
  return fetch(apiLink, {
    method: method,
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ result: data }),
  });
}
async function getData(apiLink) {
  const response = await fetch(apiLink);
  return await response.json();
}
