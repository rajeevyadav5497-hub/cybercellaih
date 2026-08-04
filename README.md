# District Aligarh Police - Cyber Wednesday Campaign Portal

Official Cybercrime Awareness Campaign Portal for **District Aligarh Police**, Uttar Pradesh. Designed for logging, tracking, and showcasing weekly Wednesday cyber safety drives across all police stations under Aligarh Cyber Crime Cell.

## 📁 Project Structure

```
cyber_awareness_app/
├── index.html            # Main HTML5 Structure, Mobile Hamburger Menu & Password Masked Modals
├── styles.css            # Responsive Desktop & Mobile Cyber Design System, Matrix Animation
├── script.js            # Central API Sync, 32 Aligarh Police Stations, Masked Password (852456), Date Filters
├── server.py            # Centralized Database REST API Server
├── data/
│   └── campaigns.json    # Central JSON File Database for Multi-Device Data Saving
├── LOGIN_INSTRUCTIONS.md # Client & Admin Access Guide
├── images/               # Campaign Photos & Media Assets
│   ├── campaign_1.jpg
│   ├── campaign_2.jpg
│   └── campaign_3.jpg
└── README.md             # Project Documentation
```

## 🚨 Included 32 Police Stations of District Aligarh

1. `PS Akarabad`
2. `PS Atruali`
3. `PS Bannadevi`
4. `PS Barla`
5. `PS Chandaus`
6. `PS Chharra`
7. `PS Civil lines`
8. `PS Cyber Police Station`
9. `PS Dadon`
10. `PS Delhigate`
11. `PS Gabhana`
12. `PS Gandhi Park`
13. `PS Gangiri`
14. `PS Gaunda`
15. `PS Godha`
16. `PS Gorai`
17. `PS Harduaganj`
18. `PS Iglas`
19. `PS Jawan`
20. `PS Khair`
21. `PS Kotwali Nagar`
22. `PS Lodha`
23. `PS Madarak`
24. `PS Mahuakheda`
25. `PS Pali Mukimpur`
26. `PS Pisawa`
27. `PS Quarsi`
28. `PS Rorawar`
29. `PS Sasnigate`
30. `PS Tappal`
31. `PS Vijargarh`
32. `Cyber Crime Cell`

## ⚙️ Central Database & Access Features
- **Centralized Saving (`server.py` & `data/campaigns.json`)**: All submissions from mobile phones & PCs save to a central JSON database.
- **Desktop & Mobile Responsive**: Touch-friendly hamburger drawer navigation.
- **Client Data Entry**: Open access for clients and field officers via `New Record` button.
- **Admin Security Mode**: Password masked input modal (`••••••••`) for Admin Login.
- **Admin Password**: `852456` (unlocks `Delete` record action column and CSV report download).
- **Sequential Re-indexing**: Auto re-indexes Sr. No. (1, 2, 3...) upon record deletion.
- **Date Range Filter**: `From Date` and `To Date` filtering controls with reset option.
- **Footer Credit**: Powered by Rajeev Kumar Cybercell Aligarh UP India.

---
Developed for District Aligarh Police Cyber Crime Cell.
