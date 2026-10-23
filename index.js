
const $ = (id) => document.getElementById(id);

const fields = [
  "fullName",
  "dob",
  "nationality",
  "idNumber",
  "organization"
];

let photoData = "";

const titles = {
  personal: "PERSONAL ID CARD",
  employee: "EMPLOYEE SAMPLE CARD",
  student: "STUDENT SAMPLE CARD",
  visitor: "VISITOR SAMPLE PASS",
  travel: "FICTIONAL TRAVEL CARD"
};

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value + "T12:00:00");

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function updateCard() {
  $("previewName").textContent =
    $("fullName").value.trim() || "Your Name";

  $("previewDob").textContent =
    formatDate($("dob").value);

  $("previewNationality").textContent =
    $("nationality").value.trim() || "Not specified";

  $("previewNumber").textContent =
    $("idNumber").value.trim() || "SAMPLE-001";

  $("previewOrg").textContent =
    $("organization").value.trim() || "Not specified";

  $("cardTitle").textContent =
    titles[$("cardType").value];

  const card = $("idCard");

  card.classList.remove(
    "blue", "green", "purple", "black"
  );

  card.classList.add($("theme").value);

  $("previewPhoto").src = photoData;
}

fields.forEach((id) => {
  $(id).addEventListener("input", updateCard);
});

$("cardType").addEventListener("change", updateCard);
$("theme").addEventListener("change", updateCard);
$("updateBtn").addEventListener("click", updateCard);

$("photo").addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
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

  reader.readAsDataURL(file);
});

$("downloadBtn").addEventListener("click", () => {
  updateCard();

  const card = $("idCard");
  const canvas = document.createElement("canvas");

  canvas.width = 1000;
  canvas.height = 630;

  const ctx = canvas.getContext("2d");

  const colors = {
    blue: ["#123e73", "#277fbd"],
    green: ["#075c43", "#21a77b"],
    purple: ["#48216f", "#9470c9"],
    black: ["#151a24", "#485262"]
  };

  const selected = colors[$("theme").value];
  const gradient = ctx.createLinearGradient(
    0, 0, 1000, 630
  );

  gradient.addColorStop(0, selected[0]);
  gradient.addColorStop(1, selected[1]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1000, 630);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px Arial";
  ctx.fillText("ID  |  " + titles[$("cardType").value], 35, 55);

  ctx.font = "18px Arial";
  ctx.fillText("EXPERIMENTAL DESIGN", 40, 88);

  function drawDetails() {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";

    ctx.fillText(
      $("fullName").value.trim() || "Your Name",
      320, 190, 640
    );

    ctx.font = "22px Arial";

    const lines = [
      "Date of Birth: " + formatDate($("dob").value),
      "Nationality: " + ($("nationality").value || "Not specified"),
      "Reference: " + ($("idNumber").value || "SAMPLE-001"),
      "Organization: " + ($("organization").value || "Not specified")
    ];

    lines.forEach((line, i) => {
      ctx.fillText(line, 320, 250 + i * 48, 640);
    });

    ctx.save();
    ctx.translate(500, 390);
    ctx.rotate(-0.25);
    ctx.fillStyle = "#ffffff26";
    ctx.font = "bold 100px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SAMPLE", 0, 0);
    ctx.restore();

    ctx.fillStyle = "#061a35";
    ctx.fillRect(0, 575, 1000, 55);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "SAMPLE — NOT AN OFFICIAL DOCUMENT",
      500, 609
    );

    const link = document.createElement("a");
    link.download = "sample-id-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if (photoData) {
    const image = new Image();

    image.onload = () => {
      const maxW = 235;
      const maxH = 340;
      const scale = Math.min(
        maxW / image.width,
        maxH / image.height
      );

      const w = image.width * scale;
      const h = image.height * scale;

      ctx.drawImage(
        image,
        40 + (maxW - w) / 2,
        150 + (maxH - h) / 2,
        w,
        h
      );

      drawDetails();
    };

    image.src = photoData;
  } else {
    ctx.fillStyle = "#d9e2ec";
    ctx.fillRect(40, 150, 235, 300);
    ctx.fillStyle = "#333333";
    ctx.font = "22px Arial";
    ctx.fillText("PHOTO", 105, 310);

    drawDetails();
  }
});

updateCard();
