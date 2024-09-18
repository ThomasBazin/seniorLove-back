document.addEventListener('DOMContentLoaded', function () {
  dropDownItems();
  userSubmitButton();
  userCancelButton();
  userDeleteButton();
  displaySuccessMessage();
  eventDeleteButton();
  eventCancelButton();
  eventSubmitButton();
  setMinTimeAndDate();
  addActiveEffect();

  let statusValue = ''; // Initialize statusValue variable

  // User page dropdown behavior
  function dropDownItems() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const dropdownButton = document.getElementById('dropdownMenuButton');
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
  }

  // User page submit button behavior
  function userSubmitButton() {
    const userSubmitButton = document.getElementById('user-submit_btn');
    if (userSubmitButton) {
      const userId = userSubmitButton.getAttribute('data-user-id');
      userSubmitButton.addEventListener('click', function (event) {
        event.preventDefault();
        console.log('button clicked');
        async function updateUserStatus(userId, statusValue) {
          try {
            await fetch(`/admin/users/${userId}/status`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: statusValue }),
            });
          } catch (error) {
            console.error('Error:', error);
          }
        }
        updateUserStatus(userId, statusValue);
        setTimeout(() => {
          location.reload();
        }, 50);
      });
    }
  }

  // User page cancel button behavior
  function userCancelButton() {
    const userCancelButton = document.getElementById('user-cancel_btn');
    if (userCancelButton) {
      userCancelButton.addEventListener('click', function (event) {
        event.preventDefault();
        window.history.back();
      });
    }
  }
  function displaySuccessMessage() {
    const message = localStorage.getItem('successMessage');
    if (message) {
      const messageContainer = document.getElementById('message-container');
      if (messageContainer) {
        // Display the message
        messageContainer.style.display = 'block';
        messageContainer.querySelector('p').textContent = message;

        // Remove the message from localStorage after displaying it
        localStorage.removeItem('successMessage');
      }
    }
  }

  // User page delete button behavior
  function userDeleteButton() {
    const userDeleteButton = document.getElementById('user-delete_btn');
    if (userDeleteButton) {
      const userId = userDeleteButton.getAttribute('data-user-id');
      userDeleteButton.addEventListener('click', function (event) {
        event.preventDefault();
        async function deleteUser(userId) {
          try {
            const response = await fetch(`/admin/users/${userId}/delete`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (response.ok) {
              localStorage.setItem('successMessage', 'Utilisateur supprimé');
              window.location.href = '/admin/users'; // Redirect to users list
            } else {
              const data = await response.json();
              throw new Error(data.message || 'Failed to delete user');
            }
          } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete user.');
          }
        }
        deleteUser(userId);
      });
    }
  }

  // Events page delete button behavior
  function eventDeleteButton() {
    const eventDeleteButtons = document.querySelectorAll('.event-delete_btn');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    if (eventDeleteButtons) {
      eventDeleteButtons.forEach((eventButton) => {
        const eventId = eventButton.getAttribute('data-event-id');
        eventButton.addEventListener('click', function (event) {
          event.preventDefault();
          confirmDeleteButton.setAttribute('data-event-id', eventId);
        });
      });
      if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', async function () {
          const eventId = this.getAttribute('data-event-id');
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
      }
    }
  }

  // Event page cancel button behavior
  function eventCancelButton() {
    const eventCancelButton = document.getElementById('createEvent-cancel_btn');
    if (eventCancelButton) {
      eventCancelButton.addEventListener('click', function (event) {
        event.preventDefault();
        window.history.back();
      });
    }
  }

  function eventSubmitButton() {
    const eventUpdateButton = document.getElementById('event-update_btn');
    const form = document.getElementById('event-form');
    if (eventUpdateButton) {
      eventUpdateButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const eventId = eventUpdateButton.getAttribute('data-event-id');

        try {
          const response = await fetch(`/admin/events/${eventId}/update`, {
            method: 'PATCH',
            body: formData,
          });
          if (response.ok) {
            window.location.href = '/admin/events'; // Redirect to events list
          } else {
            const responseData = await response.json();
            throw new Error(responseData.message || 'Failed to update event');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Failed to update event.');
        }
      });
    }
  }

  function setMinTimeAndDate() {
    const today = new Date();
    const todayDate = new Date().toISOString().split('T')[0];
    const currentTime = today.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Ensure 24-hour format
    });

    const dateElement = document.getElementById('date');
    const timeInput = document.getElementById('time');

    if (dateElement) {
      dateElement.setAttribute('min', todayDate);
      dateElement.addEventListener('change', function () {
        if (this.value === todayDate) {
          // If the selected date is today, restrict the time to the current time or later
          timeInput.setAttribute('min', currentTime);
        } else {
          // If the selected date is in the future, remove the time restriction
          timeInput.removeAttribute('min');
        }
      });
    }
  }

  function addActiveEffect() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');

    links.forEach((link) => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active-link');
      }
    });
  }
});
