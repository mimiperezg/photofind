// loads MONGODB_URI etc. from .env if there is one.
// imported first in backend.js so it runs before the routers read process.env
try {
  process.loadEnvFile();
} catch {
  console.log("no .env file, using environment variables only");
}
