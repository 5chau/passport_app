# 215 Supper Club Passport

A digital passport web application for tracking supper club attendance, cultural objects, and dishes across different locations.

## Architecture

- **Frontend**: Static HTML/CSS/JavaScript hosted on GitHub Pages
- **Backend API**: Google Apps Script
- **Database**: Google Sheets

## Deployment Instructions

### Step 1: Update Google Apps Script Backend

1. Open your Google Apps Script project at [script.google.com](https://script.google.com)
2. Open the file `code.gs`
3. **Replace the entire contents** with the code from `code_updated.gs` in this repository
4. At the top of the file, update the `GITHUB_PAGES_URL` constant:
   ```javascript
   var GITHUB_PAGES_URL = 'https://yourusername.github.io/passport-app/';
   ```
   (You'll get this URL in Step 3, so you may need to come back to update it)

5. Click **Deploy** → **New deployment**
6. Choose type: **Web app**
7. Configure deployment:
   - Description: "GitHub Pages API v3.0"
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**
9. **Copy the deployment URL** (it ends with `/exec`) - you'll need this for Step 4

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
   - Name: `passport-app` (or your choice)
   - Visibility: Public (required for GitHub Pages)
   - Don't initialize with README (we already have one)

2. Clone the repository or push your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - 215 Supper Club Passport"
   git branch -M main
   git remote add origin https://github.com/yourusername/passport-app.git
   git push -u origin main
   ```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under "Source":
   - Select branch: **main**
   - Folder: **/ (root)**
4. Click **Save**
5. Wait a few minutes for deployment
6. **Copy your GitHub Pages URL** (e.g., `https://yourusername.github.io/passport-app/`)

### Step 4: Connect Frontend to Backend

1. Open `config.js` in your repository
2. Update the `API_ENDPOINT` constant with your Google Apps Script URL from Step 1:
   ```javascript
   const API_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
3. Commit and push the change:
   ```bash
   git add config.js
   git commit -m "Update API endpoint"
   git push
   ```

### Step 5: Update Google Apps Script with GitHub Pages URL

1. Go back to your Google Apps Script project
2. Update the `GITHUB_PAGES_URL` constant with your actual GitHub Pages URL from Step 3
3. Click **Deploy** → **Manage deployments**
4. Click the **Edit** icon (pencil) next to your deployment
5. Version: **New version**
6. Click **Deploy**

### Step 6: (Optional) Update Existing User URLs

If you have existing users from the old Google Apps Script hosting, you can update their URLs:

1. In Google Apps Script, go to the script editor
2. Run the function `updateAllUrlsToGitHubPages()` from the toolbar
3. This will update all user URLs in the Google Sheet to point to GitHub Pages

### Step 7: Test Your Deployment

1. Open your GitHub Pages URL (e.g., `https://yourusername.github.io/passport-app/`)
2. You should see the registration page
3. Fill out the registration form and create a test user
4. You should be redirected to your passport with your user data loaded
5. Test all features:
   - Change passport color
   - Add objects
   - Add food
   - Stamp passport

## File Structure

```
passport_app/
├── index.html           # Main passport view
├── register.html        # User registration page
├── styles.css          # All CSS styles
├── app.js              # Passport functionality
├── register.js         # Registration form handling
├── config.js           # API endpoint configuration
├── code_updated.gs     # Google Apps Script backend (copy to Apps Script)
├── README.md           # This file
└── prev_google_scripts_app_context/  # Original Google Apps Script files (for reference)
```

## Features

- **Digital Passport**: Personalized passport for each member
- **Stamps**: Collect stamps from visited locations
- **Objects**: Track cultural objects (books, movies, art) associated with places
- **Food**: Log dishes created at each location
- **Progress Tracking**: Visual progress bar showing attendance
- **Customization**: Choose passport color from color picker
- **Sharing**: Share passport via unique URL

## Database Schema (Google Sheets)

### Users Sheet
- user_id
- first_name
- last_name
- instagram_handle
- passport_color
- created_date
- unique_url
- is_admin

### Locations Sheet
- user_id
- place
- date_visited
- stamp_date

### Objects Sheet
- user_id
- place
- object_type
- object_name
- notes
- date_added

### Food Sheet
- user_id
- place
- dish_name
- date_added

### Master_Locations Sheet
- location_id
- place
- stamp_color
- date_set
- is_active

## Troubleshooting

### "User not found" error
- Check that `config.js` has the correct API endpoint
- Verify the Google Apps Script deployment is set to "Anyone" access
- Check the browser console for error messages

### Registration not working
- Verify the API endpoint is correct in `config.js`
- Check Google Apps Script logs for errors
- Make sure the Google Sheet has proper permissions

### Changes not appearing
- **Frontend changes**: May take a few minutes for GitHub Pages to update
- **Backend changes**: Make sure you created a new deployment in Apps Script

### CORS errors
- Ensure your Google Apps Script is deployed as a web app with "Anyone" access
- The doPost function handles all API requests and returns proper JSON

## Development

To test locally:

1. You can open `index.html` directly in a browser, but API calls will fail due to CORS
2. Better option: Use a local server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Then visit http://localhost:8000
   ```

## Support

For issues or questions, check:
- Google Apps Script logs (View → Logs)
- Browser console for frontend errors
- Google Sheets to verify data is being saved

## License

Private project for 215 Supper Club members.
