# AgriQueue

AgriQueue is a plain HTML/CSS/JavaScript frontend with a PHP API and MySQL database. It can be deployed to Vercel using the community PHP runtime configured in `vercel.json`.

## Deploy to Vercel

1. Create a remotely accessible MySQL database. Vercel functions cannot connect to the MySQL server on your computer. Use a managed provider that permits connections from your deployment, and configure its network access/TLS requirements.
2. Run [`database/schema.sql`](database/schema.sql) against that database. This creates the application tables, persistent session storage, and the two procurement centers.
3. Create application users before logging in. To add the sample farmer/staff/inspector/admin accounts, run `scripts/seed.php` from a trusted machine with PHP and the required environment variables configured. Set `SEED_PASSWORD` to a unique password of at least 12 characters; all sample accounts use that password. Do not use sample accounts for a public production deployment. You can also add users through your own secure database administration process.
4. Push this folder to a GitHub repository and import it in Vercel. Select **Other** if asked for a framework. No build command or output directory is needed.
5. In Vercel, add these Project Environment Variables for Production (and Preview if required):
   - `DB_HOST`: database hostname
   - `DB_PORT`: database port (usually `3306`)
   - `DB_NAME`: database name
   - `DB_USER`: database username
   - `DB_PASSWORD`: database password
   - `DB_SSL_CA` (optional): provider CA certificate PEM contents if the database requires TLS certificate verification
6. Deploy. The static homepage is `index.html`; the PHP API is served from `/api` and its session state is stored in the MySQL `app_sessions` table.

For a local PowerShell seed run, set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `SEED_PASSWORD` in the shell, then run `php .\scripts\seed.php`. Keep database credentials and seed passwords out of source control.

## Local development

The PHP runtime and PDO MySQL extension are required to run the API. Configure the same database variables locally, run `database/schema.sql`, and use a PHP-capable local web server with this folder as its document root. Opening `index.html` directly in a browser will not run the PHP API.
