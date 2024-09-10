document.addEventListener('DOMContentLoaded', function () {
  // const eventUpdateButtons = document.querySelectorAll('.event-update_btn');

  // User page dropdown behavior
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const dropdownButton = document.getElementById('dropdownMenuButton');
  let statusValue = ''; // Default value
  dropdownItems.forEach(function (item) {
    item.addEventListener('click', function () {
      const newValue = item.getAttribute('data-value');

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
    });
  });

  // User page submit button behavior
  const userSubmitButton = document.getElementById('user-submit_btn');
  if (userSubmitButton) {
    const userId = userSubmitButton.getAttribute('data-user-id');
    userSubmitButton.addEventListener('click', function (event) {
      event.preventDefault();
      // Perform the fetch request to update user status
      fetch(`/admin/users/${userId}/status`, {
        method: 'PATCH',
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
      location.reload();
    });
  }

  // User page cancel button behavior
  const userCancelButton = document.getElementById('user-cancel_btn');
  if (userCancelButton) {
    userCancelButton.addEventListener('click', function (event) {
      event.preventDefault();
      window.history.back();
    });
  }

  // User page delete button behavior
  const userDeleteButton = document.getElementById('user-delete_btn');
  if (userDeleteButton) {
    const userId = userDeleteButton.getAttribute('data-user-id');
    userDeleteButton.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default link behavior
      // Confirm the deletion
      fetch(`/admin/users/${userId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = '/admin/users'; // Redirect to users list
          } else {
            return response.json().then((data) => {
              throw new Error(data.message || 'Failed to delete user');
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Failed to delete user.');
        });
    });
  }

  // User page hobby checkbox behavior
  const hobbiesCheckboxes = document.querySelectorAll('.hobby-checkbox');
  // Check if hobbiesCheckboxes is defined and not null
  if (hobbiesCheckboxes) {
    // Iterate over each checkbox element in the hobbiesCheckboxes NodeList
    hobbiesCheckboxes.forEach(function (checkbox) {
      // Add an event listener to each checkbox that listens for changes
      checkbox.addEventListener('change', function () {
        // Create an array of checked checkboxes
        const checkedHobbies = Array.from(hobbiesCheckboxes)
          // Filter the checkboxes to include only those that are checked
          .filter(function (checkbox) {
            return checkbox.checked;
          })
          // Map the filtered checkboxes to their values
          .map(function (checkbox) {
            return checkbox.value;
          });
      });
    });
  }

  // Events page delete button behavior
  const eventDeleteButtons = document.querySelectorAll('.event-delete_btn');
  if (eventDeleteButtons) {
    eventDeleteButtons.forEach((eventButton) => {
      const eventId = eventButton.getAttribute('data-event-id');
      eventButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default link behavior

        // Confirm the deletion
        async function deleteEvent(eventId) {
          try {
            const response = await fetch(`/admin/events/${eventId}/delete`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (response.ok) {
              window.location.href = '/admin/events'; // Redirect to events list
            } else {
              const data = await response.json();
              throw new Error(data.message || 'Failed to delete event');
            }
          } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete event.');
          }
        }
        deleteEvent(eventId);
      });
    });
  }

  // Event page cancel button behavior
  const eventCancelButton = document.getElementById('createEvent-cancel_btn');
  if (eventCancelButton) {
    eventCancelButton.addEventListener('click', function (event) {
      event.preventDefault();
      window.history.back();
    });
  }
});
