// Initialize the Telegram WebApp
const tgApp = window.Telegram.WebApp;

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Expand the Web App to full height
    tgApp.expand();

    // Set theme according to Telegram settings
    document.documentElement.className = tgApp.colorScheme;

    // Display user information
    if (tgApp.initDataUnsafe && tgApp.initDataUnsafe.user) {
        const user = tgApp.initDataUnsafe.user;
        document.getElementById('user-name').textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        document.getElementById('user-id').textContent = 'ID: ' + user.id;
    }

    // Configure main button if available
    if (tgApp.MainButton) {
        tgApp.MainButton.setText('CONFIRM');
        tgApp.MainButton.hide();

        document.getElementById('main-button').addEventListener('click', function() {
            if (tgApp.MainButton.isVisible) {
                tgApp.MainButton.hide();
                this.textContent = 'Show Main Button';
            } else {
                tgApp.MainButton.show();
                this.textContent = 'Hide Main Button';
            }
        });

        tgApp.MainButton.onClick(function() {
            tgApp.showAlert('Main button clicked!');
        });
    }

    // Set up send data button
    document.getElementById('send-data').addEventListener('click', function() {
        const data = {
            action: 'example',
            timestamp: Date.now()
        };
        tgApp.sendData(JSON.stringify(data));
    });

    // Show BackButton if available
    if (tgApp.BackButton) {
        tgApp.BackButton.show();
        tgApp.BackButton.onClick(function() {
            tgApp.showAlert('Going back...', function() {
                tgApp.close();
            });
        });
    }
}); 