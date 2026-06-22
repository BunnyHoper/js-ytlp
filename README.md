# 🌌 bunny-yt-dlp - Interactive CLI Downloader
[![GitHub repo](https://img.shields.io/badge/github-BunnyHoper-blue?style=for-the-badge&logo=github)](https://github.com/BunnyHoper)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%2018+-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Engine](https://img.shields.io/badge/Engine-yt--dlp-red?style=for-the-badge)](https://github.com/yt-dlp/yt-dlp)

> **Streamline your media downloads (fast & clean).** This tool provides a professional, interactive Command Line Interface (CLI) wrapped around the powerful yt-dlp engine, featuring smart playlist detection, custom path switching, and graceful execution controls.

---

## ✨ Introduction: Optimized Terminal Downloads

Stop typing long terminal commands or using shady web downloaders. **bunny-yt-dlp** gives you a highly responsive, custom-colored terminal menu to process links instantly. It handles single URLs and entire playlists seamlessly, managing process execution in the background with animated loaders and automated metadata embedding.

---

## 🛠️ Core Capabilities

* **Smart Download Modes:** One-click automated extraction for High-Quality Audio (MP3 320kbps) or Maximum Quality Video (MP4) with metadata and thumbnail embedding.
* **Manual Format Selector:** Advanced extraction mode that lists all available stream IDs directly from the source, letting you choose explicit formats (e.g., specific video/audio combinations).
* **Dynamic Workspace Control:** Change your target directory path on the fly directly inside the CLI app settings without modifying any script variables.
* **Robust Session Management:** Built-in clean-state terminal re-initialization and SIGINT (`Ctrl+C`) custom interceptors to cleanly cancel active downloads and safely return to the main menu.
* **Native Engine Updates:** Quick-access control option to instantly trigger core `yt-dlp` updates directly to the engine binary.

---

## 📂 Architecture & Files

| File / Folder | Type | Action |
| :--- | :---: | :--- |
| `index.js` | **Core** | Main application file. Contains the operational loop, ANSI UI rendering, and child process wrapper. |
| `yt-dlp` / `yt-dlp.exe` | **Binary** | The required core execution engine placed directly within the root project directory. |
| `/output` | **Directory** | The default automated destination folder created dynamically for all downloaded media. |

---

## ⚙️ Quick Start Guide

1.  **Environment Setup:** Ensure you have Node.js installed, then place the script inside your workspace.

2.  **Engine Dependency:** Download the `yt-dlp` binary (or `yt-dlp.exe` on Windows) and place it directly in the same root folder alongside your script.

3.  **Execute:** Launch the application terminal interface using:
    ```bash
    node index.js
    ```

4.  **Usage:** Select your preferred mode from the terminal dashboard, paste your target URL, and let the script handle the extraction pipeline. Use `Ctrl+C` at any time to return to the menu or quit safely.

---

## 🤝 Contribution & Support

Contributions are welcome. If you want to enhance the CLI interface or add custom presets:

1.  Fork the repository.
2.  Create your custom branch.
3.  Commit your script updates.
4.  Open a **Pull Request**.

---

## 📜 License

This project is released under the [MIT License](LICENSE).

***
*Built with ❤️ by Bunny.*