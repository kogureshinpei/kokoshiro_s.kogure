/* Sugoshu demo JS
   - Upload (index.html): drag&drop + file picker + simple validation
     + save preview to localStorage then navigate to locked page.
   - Locked page (page2/index.html): reads preview from localStorage and shows it behind mosaic.

   This is a UI/UX demo (no actual AI processing).
*/
(function () {
  const MAX_MB = 10;
  const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

  function bytesToMB(bytes) {
    return bytes / 1024 / 1024;
  }

  function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  function setPreviewBackground(el, dataUrl) {
    if (!el) return;
    el.style.backgroundImage = `url('${dataUrl.replace(/'/g, "\\'")}')`;
  }

  // ===== Upload page =====
  const drop = document.querySelector("[data-dropzone]");
  const fileInput = document.querySelector("#fileInput");
  const pickBtn = document.querySelector("[data-pick]");
  const errorEl = document.querySelector("[data-error]");

  async function handleFile(file) {
    if (!file) return;

    // Reset error
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.add("hidden");
    }

    if (!ALLOWED.includes(file.type)) {
      if (errorEl) {
        errorEl.textContent = "JPG / PNG / WebP の画像を選択してください。";
        errorEl.classList.remove("hidden");
      }
      return;
    }

    if (bytesToMB(file.size) > MAX_MB) {
      if (errorEl) {
        errorEl.textContent = `ファイルサイズが大きすぎます（最大 ${MAX_MB}MB）。`;
        errorEl.classList.remove("hidden");
      }
      return;
    }

    const dataUrl = await readAsDataURL(file);

    // Store for page2
    try {
      localStorage.setItem("sugoshu.preview", dataUrl);
      localStorage.setItem("sugoshu.filename", file.name);
      localStorage.setItem("sugoshu.type", file.type);
    } catch (e) {
      // ignore
    }

    // Navigate
    window.location.href = "./page2/index.html";
    // フォルダがpade2のままなら上を ./pade2/index.html に変更
  }

  function prevent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (drop && fileInput) {
    // Click => open file picker
    drop.addEventListener("click", () => fileInput.click());

    if (pickBtn) {
      pickBtn.addEventListener("click", (e) => {
        e.preventDefault();
        fileInput.click();
      });
    }

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      await handleFile(file);
      fileInput.value = "";
    });

    ["dragenter", "dragover"].forEach((ev) => {
      drop.addEventListener(ev, (e) => {
        prevent(e);
        drop.classList.add("is-dragover");
      });
    });

    ["dragleave", "drop"].forEach((ev) => {
      drop.addEventListener(ev, (e) => {
        prevent(e);
        drop.classList.remove("is-dragover");
      });
    });

    drop.addEventListener("drop", async (e) => {
      const dt = e.dataTransfer;
      const file = dt && dt.files && dt.files[0];
      await handleFile(file);
    });
  }

  // ===== Locked page =====
  const previewBg = document.querySelector("[data-preview-bg]");
  if (previewBg) {
    const dataUrl = localStorage.getItem("sugoshu.preview");
    if (dataUrl) setPreviewBackground(previewBg, dataUrl);

    const signupBtn = document.querySelector("[data-signup]");
    if (signupBtn) {
      signupBtn.addEventListener("click", () => {
        alert("デモ：ここで会員登録フローへ遷移します。");
      });
    }
    const loginBtn = document.querySelector("[data-login]");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        alert("デモ：ここでログインフローへ遷移します。");
      });
    }
  }
})();