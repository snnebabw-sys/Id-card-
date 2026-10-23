
const $ = (id) => document.getElementById(id);

const titles = {
  personal: "PERSONAL ID CARD",
  employee: "EMPLOYEE SAMPLE CARD",
  student: "STUDENT SAMPLE CARD",
  visitor: "VISITOR SAMPLE PASS",
  travel: "FICTIONAL TRAVEL CARD"
};

const colors = {
  blue: ["#123e73", "#277fbd"],
  green: ["#075c43", "#21a77b"],
  purple: ["#48216f", "#9470c9"],
  black: ["#151a24", "#485262"]
};

let photoData = "";

function value(id, fallback = "") {
  return $(id).value.trim() || fallback;
}

function formatDate(input) {
  if (!input) return "Not specified";

  return new Date(input + "T12:00:00").toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function updateCard() {
  const isMarriage = $("cardType").value === "marriage";
  const card = $("idCard");

  $("idFields").hidden = isMarriage;
  $("marriageFields").hidden = !isMarriage;
  $("idDocument").hidden = isMarriage;
  $("marriageDocument").hidden = !isMarriage;

  card.classList.toggle("marriage", isMarriage);

  if (isMarriage) {
    $("cardFooter").textContent = "COMMEMORATIVE SAMPLE CERTIFICATE";

    $("previewPartnerOne").textContent =
      value("partnerOne", "First Partner");

    $("previewPartnerTwo").textContent =
      value("partnerTwo", "Second Partner");

    $("previewMarriageDate").textContent =
      formatDate($("marriageDate").value);

    $("previewVenue").textContent =
      value("marriageVenue", "Not specified");

    $("previewWitnessOne").textContent =
      value("witnessOne", "Not specified");

    $("previewWitnessTwo").textContent =
      value("witnessTwo", "Not specified");

    $("previewOfficiant").textContent =
      value("officiant", "Not specified");

    return;
  }

  card.classList.remove("blue", "green", "purple", "black");
  card.classList.add($("theme").value);

  $("cardTitle").textContent = titles[$("cardType").value];
  $("cardFooter").textContent = "PERSONAL SAMPLE CARD";

  $("previewName").textContent = value("fullName", "Your Name");
  $("previewDob").textContent = formatDate($("dob").value);
  $("previewNationality").textContent =
    value("nationality", "Not specified");
  $("previewNumber").textContent =
    value("idNumber", "SAMPLE-001");
  $("previewOrg").textContent =
    value("organization", "Not specified");

  const photo = $("previewPhoto");

  if (photoData) {
    photo.src = photoData;
    photo.hidden = false;
  } else {
    photo.removeAttribute("src");
    photo.hidden = true;
  }
}

const allInputs = document.querySelectorAll(
  ".editor input, .editor select"
);

allInputs.forEach((input) => {
  input.addEventListener("input", updateCard);
  input.addEventListener("change", updateCard);
});

$("updateBtn").addEventListener("click", updateCard);

$("photo").addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    photoData = "";
    updateCard();
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Please choose an image under 5 MB.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    photoData = reader.result;
    updateCard();
  };

  reader.onerror = () => {
    alert("Could not read the selected image.");
  };

  reader.readAsDataURL(file);
});

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  let line = "";

  for (const word of words) {
    const testLine = line ? line + " " + word : word;

    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) ctx.fillText(line, x, y);

  return y + lineHeight;
}

function downloadCard() {
  updateCard();

  const isMarriage = $("cardType").value === "marriage";
  const canvas = document.createElement("canvas");

  canvas.width = 1400;
  canvas.height = 990;

  const ctx = canvas.getContext("2d");

  if (isMarriage) {
    drawMarriageCertificate(ctx, canvas);
    return;
  }

  drawIdCard(ctx, canvas);
}

function drawIdCard(ctx, canvas) {
  const selected = colors[$("theme").value];
  const gradient = ctx.createLinearGradient(0, 0, 1400, 990);

  gradient.addColorStop(0, selected[0]);
  gradient.addColorStop(1, selected[1]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.font = "bold 42px Arial";

  drawWrappedText(
    ctx,
    "ID | " + titles[$("cardType").value],
    50, 70, 1300, 50
  );

  ctx.font = "24px Arial";
  ctx.fillText("PERSONAL IDENTIFICATION", 55, 115);

  function finish() {
    ctx.save();
    ctx.translate(700, 610);
    ctx.rotate(-0.25);
    ctx.fillStyle = "#ffffff30";
    ctx.font = "bold 145px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SAMPLE", 0, 0);
    ctx.restore();

    ctx.fillStyle = "#061a35";
    ctx.fillRect(0, 900, 1400, 90);

    ctx.fillStyle = "white";
    ctx.font = "bold 25px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PERSONAL SAMPLE CARD", 700, 955);

    saveCanvas(canvas, "personal-sample-card.png");
  }

  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.font = "bold 42px Arial";

  drawWrappedText(ctx, value("fullName", "Your Name"), 440, 300, 900, 50);

  ctx.font = "29px Arial";

  const lines = [
    "Date of Birth: " + formatDate($("dob").value),
    "Nationality: " + value("nationality", "Not specified"),
    "Reference: " + value("idNumber", "SAMPLE-001"),
    "Organization: " + value("organization", "Not specified")
  ];

  let y = 390;

  lines.forEach((line) => {
    y = drawWrappedText(ctx, line, 440, y, 900, 38) + 8;
  });

  if (photoData) {
    const image = new Image();

    image.onload = () => {
      ctx.drawImage(image, 55, 200, 310, 420);
      finish();
    };

    image.onerror = () => {
      alert("Unable to load photo for download.");
    };

    image.src = photoData;
  } else {
    ctx.fillStyle = "#d9e2ec";
    ctx.fillRect(55, 200, 310, 420);

    ctx.fillStyle = "#333333";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("NO PHOTO", 210, 420);

    finish();
  }
}

function drawMarriageCertificate(ctx, canvas) {
  ctx.fillStyle = "#f8f1df";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#ad8b4b";
  ctx.lineWidth = 7;
  ctx.strokeRect(25, 25, 1350, 940);

  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, 1316, 906);

  ctx.textAlign = "center";
  ctx.fillStyle = "#85682f";
  ctx.font = "bold 23px Arial";

  ctx.fillText("COMMEMORATIVE KEEPSAKE", 700, 100);

  ctx.fillStyle = "#72521c";
  ctx.font = "bold 70px Georgia";
  ctx.fillText("Marriage Certificate", 700, 190);

  ctx.font = "45px Georgia";
  ctx.fillText("❦", 700, 245);

  ctx.fillStyle = "#49351d";
  ctx.font = "30px Georgia";
  ctx.fillText("Celebrating the union of", 700, 305);

  ctx.fillStyle = "#513b1e";
  ctx.font = "bold 43px Georgia";

  drawWrappedText(
    ctx, value("partnerOne", "First Partner"),
    700, 380, 1150, 52
  );

  ctx.fillStyle = "#ad8b4b";
  ctx.font = "italic 36px Georgia";
  ctx.fillText("&", 700, 435);

  ctx.fillStyle = "#513b1e";
  ctx.font = "bold 43px Georgia";

  drawWrappedText(
    ctx, value("partnerTwo", "Second Partner"),
    700, 495, 1150, 52
  );

  ctx.fillStyle = "#49351d";
  ctx.font = "27px Georgia";
  ctx.fillText(
    "Celebrated on " + formatDate($("marriageDate").value),
    700, 560
  );

  ctx.font = "24px Georgia";
  drawWrappedText(
    ctx,
    "Venue: " + value("marriageVenue", "Not specified"),
    700, 610, 1150, 34
  );

  ctx.font = "21px Georgia";
  ctx.fillText(
    "Witness One: " + value("witnessOne", "Not specified"),
    390, 700
  );

  ctx.fillText(
    "Witness Two: " + value("witnessTwo", "Not specified"),
    1010, 700
  );

  ctx.fillText(
    "Celebrant: " + value("officiant", "Not specified"),
    700, 760
  );

  ctx.fillStyle = "#ad8b4b";
  ctx.fillRect(150, 810, 1100, 2);

  ctx.fillStyle = "#765c2a";
  ctx.font = "bold 20px Arial";
  ctx.fillText(
    "COMMEMORATIVE SAMPLE — NOT A LEGAL MARRIAGE RECORD",
    700, 855
  );

  ctx.font = "bold 22px Arial";
  ctx.fillText("SAMPLE KEEPSAKE CERTIFICATE", 700, 910);

  saveCanvas(canvas, "commemorative-marriage-certificate.png");
}

function saveCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

$("downloadBtn").addEventListener("click", downloadCard);

updateCard();
