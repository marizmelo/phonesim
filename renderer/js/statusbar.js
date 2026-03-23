function updateStatusBarTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeEl = document.getElementById('status-time');

  if (document.body.classList.contains('android')) {
    timeEl.textContent = `${hours}:${minutes}`;
  } else {
    // iOS uses 12-hour without AM/PM in status bar
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    timeEl.textContent = `${hours}:${minutes}`;
  }
}

// Update every 30 seconds
setInterval(updateStatusBarTime, 30000);
updateStatusBarTime();
