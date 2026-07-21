const apiKey = "AIzaSyCeoaVsX9m7Gojh5CczaspVITyVog3kfOI";
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log(data.models.map(m => m.name).join('\n'));
    } else {
      console.log("Error:", data);
    }
  })
  .catch(err => console.error(err));
