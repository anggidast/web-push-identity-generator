const publicVapidKey = 'BBBtQpsQgp6rQn8AAjJvWt3jafkrva8afcvVeTsDtaVjkFEk16l0K8AOQjoCYpzhSjsgLYDFehvjZowr1_fQDDw';

function getData(form) {
  var formData = new FormData(form);

  // ...or output as an object
  console.log(Object.fromEntries(formData));
  var data = Object.fromEntries(formData);
  var email = data.email;

  // Check for service worker
  if ('serviceWorker' in navigator) {
    send(email).catch((err) => console.error(err));
  }
}

// Register SW, Register Push, Send Push
async function send(email) {
  try {
    // Register Service Worker
    console.log('Registering service worker...');
    const register = await navigator.serviceWorker.register('/web-push-identity-generator/sw.js', {
      scope: '/web-push-identity-generator/',
    });
    console.log('Service Worker Registered...');

    // Register Push
    console.log('Registering Push...');
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    console.log('Push Registered...');

    // Send Push Notification
    console.log('Sending Push...');
    console.log('Your subscription:');
    console.log(JSON.stringify(subscription, null, 2));
    await fetch('https://aixp-rudder-api-aks.digitallab.id/6405dcdc-0812-4eb0-83e7-eb79d81b6a1f/70093b87-5178-40a4-a6f1-9df5d9e5b7ab/v1/batch', {
      method: 'POST',
      body: JSON.stringify({
        batch: [
          {
            anonymousId: uuidv4(),
            context: {
              traits: {
                email,
                webpushEndpoint: subscription.endpoint,
                webpushKeys: JSON.stringify(subscription.keys),
              },
            },
            messageId: `api-${uuidv4()}`,
            originalTimestamp: new Date().toISOString(),
            sentAt: new Date().toISOString(),
            type: 'identify',
            userId: email,
          },
        ],
        sentAt: new Date().toISOString(),
      }),
      headers: {
        'content-type': 'application/json',
        Authorization: 'Basic MWxnQ0l0SjBGTjVxU3VzYnZaVkVTSGpFSExxOg==',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      },
    });
    console.log('Push Sent...');
  } catch (error) {
    throw error;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uuidv4() {
  var d = new Date().getTime(); //Timestamp
  var d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

document.getElementById('myForm').addEventListener('submit', function (e) {
  e.preventDefault();
  getData(e.target);
});
