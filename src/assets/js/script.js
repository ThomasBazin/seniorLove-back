document.addEventListener('DOMContentLoaded', function () {
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const dropdownButton = document.getElementById('dropdownMenuButton');

  dropdownItems.forEach(function (item) {
    item.addEventListener('click', function () {
      const newValue = item.getAttribute('data-value');
      dropdownButton.textContent = newValue;
      if (newValue === 'PENDING') {
        dropdownButton.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
        dropdownButton.style.color = 'black';
      } else if (newValue === 'ACTIVE') {
        dropdownButton.style.backgroundColor = 'rgba(0, 128, 0, 0.5)';
        dropdownButton.style.color = 'black';
      } else {
        dropdownButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        dropdownButton.style.color = 'black';
      }
    });
  });
});
