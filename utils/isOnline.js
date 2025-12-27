// utils/isOnline.js
import dns from "dns";

export default async function isOnline() {
  return new Promise((resolve) => {
    dns.lookup("google.com", (err) => {
      if (err) {
        console.log("OFFLINE → Cloudinary désactivé");
        return resolve(false);
      }
      console.log("ONLINE → Cloudinary activé");
      resolve(true);
    });
  });
}
