Viewed README.md:1-100
Viewed README.md:101-173
Viewed package.json:1-35
Created package.json
Created run-all.ps1
Created run-all.sh
Ran command: `npm run type-check`

I have created execution scripts for running the project services concurrently:

---

### 1. PowerShell Script: [run-all.ps1](file:///d:/Neo_Newie/Projects/web_hmptiunesa/run-all.ps1) *(Recommended for Windows)*

Launch from the project root:

```powershell
# Standard: Launches Frontend in its own terminal window
.\run-all.ps1

# Launch Frontend AND the Express backend simultaneously (separate windows)
.\run-all.ps1 -Backend

# Include local Supabase stack if you use Supabase CLI
.\run-all.ps1 -Backend -Supabase

# Run inside the same terminal window (with automatic cleanup on Ctrl+C)
.\run-all.ps1 -Backend -SameWindow
```

---

### 2. Bash / Git Bash Script: [run-all.sh](file:///d:/Neo_Newie/Projects/web_hmptiunesa/run-all.sh) *(For Linux / macOS / Git Bash)*

```bash
# Frontend only
./run-all.sh

# Run both Frontend and Backend concurrently with graceful SIGINT cleanup
./run-all.sh --backend
```

---

### 3. Root [package.json](file:///d:/Neo_Newie/Projects/web_hmptiunesa/package.json) Shortcuts

You can also run project tasks directly from the root folder without changing directories:

```bash
npm run dev             # Start Vite frontend (http://localhost:5173)
npm run dev:backend     # Start legacy Express backend
npm run build           # Build frontend for production
npm run type-check      # Run vue-tsc across all project files
```