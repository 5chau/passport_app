// Handle registration form submission
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('registrationForm');
  const submitBtn = document.getElementById('submitBtn');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    let instaHandle = document.getElementById('instaHandle').value.trim();

    // Remove @ if user included it
    instaHandle = instaHandle.replace('@', '');

    // Validate inputs
    if (!firstName || !lastName || !instaHandle) {
      showError('Please fill in all fields');
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    hideMessages();

    try {
      // Call API to register user
      // Use text/plain to avoid CORS preflight
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          action: 'registerUser',
          firstName: firstName,
          lastName: lastName,
          instaHandle: instaHandle
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.success && result.userId) {
        // Success! Show message and redirect
        showSuccess('Passport created! Redirecting...');

        // Redirect to passport page with userId
        setTimeout(() => {
          window.location.href = `index.html?user_id=${result.userId}`;
        }, 1500);
      } else {
        throw new Error('Failed to create passport. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('Error: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Passport';
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
  }

  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
  }

  function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
  }
});
