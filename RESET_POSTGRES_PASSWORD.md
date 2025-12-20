# How to Reset PostgreSQL Password on Windows

If you don't remember your PostgreSQL password, here are several ways to reset it:

## Method 1: Using Windows Authentication (Easiest)

PostgreSQL on Windows allows "trusted" authentication for local connections. We can use this to reset the password:

### Step 1: Edit PostgreSQL Configuration

1. Navigate to your PostgreSQL data directory (usually):
   ```
   C:\Program Files\PostgreSQL\16\data
   ```

2. Find and open `pg_hba.conf` in Notepad (Run as Administrator)

3. Find lines that look like this:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            scram-sha-256
   ```

4. Temporarily change `scram-sha-256` to `trust`:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            trust
   ```

5. Save the file

### Step 2: Restart PostgreSQL Service

Open PowerShell as Administrator and run:
```powershell
Restart-Service postgresql-x64-16
```

### Step 3: Reset Password

Now you can connect without a password and reset it:

```powershell
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -U postgres -d postgres
```

Once connected, run:
```sql
ALTER USER postgres PASSWORD 'your_new_password';
\q
```

### Step 4: Restore Security

1. Go back to `pg_hba.conf`
2. Change `trust` back to `scram-sha-256`
3. Save the file
4. Restart PostgreSQL service again:
   ```powershell
   Restart-Service postgresql-x64-16
   ```

## Method 2: Create a New Superuser (Alternative)

If you don't want to reset the postgres password, create a new user:

After Step 2 above (with trust authentication enabled):

```powershell
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -U postgres -d postgres
```

Then:
```sql
CREATE USER shortsync WITH PASSWORD 'your_password' SUPERUSER;
CREATE DATABASE shortsync OWNER shortsync;
\q
```

Update your `.env` file to use this new user:
```
DATABASE_URL="postgresql://shortsync:your_password@localhost:5432/shortsync?schema=public"
```

## Method 3: Try Default Passwords First

Before going through the reset process, try these common passwords in pgAdmin4:

1. Open pgAdmin4
2. Right-click on "Servers" → "Register" → "Server..."
3. **General tab**: Name = "Local PostgreSQL"
4. **Connection tab**:
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: Try these one by one:
     - `postgres`
     - `admin`
     - `root`
     - `password`
     - Leave blank (empty)

## Quick Test Command

Once you think you have the password, test it:

```powershell
$env:PGPASSWORD='YOUR_PASSWORD'; & 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -U postgres -c "SELECT version();"
```

If it shows the PostgreSQL version, the password is correct!

---

**Need help with any of these steps? Let me know which method you'd like to try!**
