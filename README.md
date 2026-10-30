# Oscar's Auto Center – Website

A static website (HTML/CSS/JS, no build step) for Oscar's Auto Center in Ocala, FL.

## Edit business info
Open `script.js` and change the `BUSINESS` block at the top: phone, address, hours, email.
Every phone link, map, and hours table on the site updates from there.

## Photos
The photos are stock images served from Unsplash. To use your own shop photos, put them in an
`images/` folder and change the `src`/`srcset` URLs in `index.html`. Use photos at least
2000px wide for the hero/banner and 1200px wide for the About photo so they stay sharp.

## Deploy to Vercel
1. Go to https://vercel.com/new and import this GitHub repo.
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Click **Deploy**.
