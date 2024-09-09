document.addEventListener('DOMContentLoaded', function () {
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const dropdownButton = document.getElementById('dropdownMenuButton');
  let statusValue = ''; // Default value
  const submitButton = document.getElementById('submit-btn');

  dropdownItems.forEach(function (item) {
    item.addEventListener('click', function (event) {
      event.preventDefault();

      const newValue = item.getAttribute('data-value');
      const userId = item.getAttribute('data-user-id');

      // Update dropdown button text and style
      dropdownButton.textContent = newValue;
      dropdownButton.style.color = 'black';
      statusValue = newValue.toLowerCase();

      // Update button background color based on selected status
      if (newValue === 'PENDING') {
        dropdownButton.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
      } else if (newValue === 'ACTIVE') {
        dropdownButton.style.backgroundColor = 'rgba(0, 128, 0, 0.5)';
      } else {
        dropdownButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
      }

      // Perform the fetch request to update user status
      fetch(`/admin/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statusValue }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data);
          // Optionally, update the UI or redirect
        })
        .catch((error) => {
          console.error('Error:', error);
          // Optionally, show an error message
        });
    });
  });
  if (submitButton) {
    submitButton.addEventListener('click', function (event) {
      event.preventDefault();
      location.reload();
    });
  }
});
