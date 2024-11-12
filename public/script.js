// async function fetchData() {
//     const location = document.getElementById("databaseSelect").value;
//     const url = location === 'both' ? '/combinedData' : `/${location}`;
//     const response = await fetch(url);
//     const data = await response.json();
//     displayData(data);
// }


// function displayData(data) {
//     let outputDiv = document.getElementById("output");
//     outputDiv.innerHTML = '';

//     if (!data || (Array.isArray(data) && data.length === 0) || (data.mongoData && data.mongoData.length === 0 && data.mysqlData.length === 0)) {
//         outputDiv.innerHTML = "<p>No data available.</p>";
//         return;
//     }

//     let combinedData = data;

//     if (data.mongoData && data.mysqlData) {
//         combinedData = [...data.mongoData, ...data.mysqlData];
//     }

//     let tableHtml = `<table>
//                          <tr>
//                              <th>Product ID</th>
//                              <th>Product Name</th>
//                              <th>Price</th>
//                              <th>Stock</th>
//                              <th>Actions</th>
//                          </tr>`;

//     combinedData.forEach((row) => {
//         tableHtml += `<tr>
//             <td>${row._id || row.ProductID}</td>
//             <td>${row.ProductName}</td>
//             <td>${row.Price}</td>
//             <td>${row.Stock}</td>
//             <td ><div id="myDIV">
//                 <button onclick="editData('${row._id || row.ProductID}')">Edit</button>
//                 <button id="bt" onclick="deleteData('${row._id || row.ProductID}')">Delete</button> </div>
//             </td>
//         </tr>`;
//     });

//     tableHtml += `</table>`;
//     outputDiv.innerHTML = tableHtml;
// }


// async function insertData() {
//     const location = document.getElementById("databaseSelect").value;
//     const productName = document.getElementById("productName").value;
//     const price = parseFloat(document.getElementById("price").value);
//     const stock = parseInt(document.getElementById("stock").value);

//     console.log('Inserting data:', { location, productName, price, stock });

//     const response = await fetch(`/${location}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ProductName: productName, Price: price, Stock: stock })
//     });
//     const result = await response.json();
//     alert(result.message);
//     console.log('Data inserted, refreshing view.');
//     fetchData();  // Refresh data display
// }


// async function editData(productId) {
//     const productName = prompt("Enter new product name:");
//     const price = prompt("Enter new price:");
//     const stock = prompt("Enter new stock:");

//     if (!productName || !price || !stock) return alert("All fields are required.");

//     const location = document.getElementById("databaseSelect").value;
//     const response = await fetch(`/${location}/${productId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             ProductName: productName,
//             Price: parseFloat(price),
//             Stock: parseInt(stock)
//         })
//     });
//     const result = await response.json();
//     alert(result.message);
//     fetchData();  // Refresh data display
// }

// async function deleteData(productId) {
//     const location = document.getElementById("databaseSelect").value;

//     if (!confirm("Are you sure you want to delete this item?")) return;

//     const response = await fetch(`/${location}/${productId}`, {
//         method: 'DELETE'
//     });
//     const result = await response.json();
//     alert(result.message);
//     fetchData();  // Refresh data display
// }


            async function fetchData() {
                const location = document.getElementById("databaseSelect").value;
                const url = location === 'both' ? '/combinedData' : `/${location}`;
                const response = await fetch(url);
                const data = await response.json();
                displayData(data);
            }

            function displayData(data) {
                let outputDiv = document.getElementById("output");
                outputDiv.innerHTML = '';

                if (!data || (Array.isArray(data) && data.length === 0) || (data.mongoData && data.mongoData.length === 0 && data.mysqlData.length === 0)) {
                    outputDiv.innerHTML = "<p>No data available.</p>";
                    return;
                }

                let combinedData = data;

                if (data.mongoData && data.mysqlData) {
                    combinedData = [...data.mongoData, ...data.mysqlData];
                }

                let tableHtml = `<table>
                                    <tr>
                                        <th>Product ID</th>
                                        <th>Product Name</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Actions</th>
                                    </tr>`;

                combinedData.forEach((row) => {
                    tableHtml += `<tr>
                        <td>${row._id || row.ProductID}</td>
                        <td>${row.ProductName}</td>
                        <td>${row.Price}</td>
                        <td>${row.Stock}</td>
                        <td id="myDIV">
                            <button  onclick="editData('${row._id || row.ProductID}')">Edit</button>
                            <button  id="bt" onclick="deleteData('${row._id || row.ProductID}')">Delete</button>
                        </td>
                    </tr>`;
                });

                tableHtml += `</table>`;
                outputDiv.innerHTML = tableHtml;
            }

            async function insertData() {
                const location = document.getElementById("databaseSelect").value;
                const productName = document.getElementById("productName").value;
                const price = parseFloat(document.getElementById("price").value);
                const stock = parseInt(document.getElementById("stock").value);

                console.log('Inserting data:', { location, productName, price, stock });

                const response = await fetch(`/${location}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ProductName: productName, Price: price, Stock: stock })
                });
                const result = await response.json();
                alert(result.message);
                console.log('Data inserted, refreshing view.');
                fetchData();  // Refresh data display
                resetForm();  // Clear the form
            }

            function resetForm() {
                document.getElementById("productName").value = "";
                document.getElementById("price").value = "";
                document.getElementById("stock").value = "";
                console.log('Form reset');
            }

            async function editData(productId) {
                const productName = prompt("Enter new product name:");
                const price = prompt("Enter new price:");
                const stock = prompt("Enter new stock:");
              
                if (!productName || !price || !stock) return alert("All fields are required.");
              
                const location = document.getElementById("databaseSelect").value;
                let response;
                if (location === 'both') {
                  const mongoResponse = await fetch(`/locationB/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ProductName: productName,
                      Price: parseFloat(price),
                      Stock: parseInt(stock)
                    })
                  });
              
                  const mysqlResponse = await fetch(`/locationA/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ProductName: productName,
                      Price: parseFloat(price),
                      Stock: parseInt(stock)
                    })
                  });
              
                  response = await Promise.all([mongoResponse.json(), mysqlResponse.json()]);
                } else {
                  response = await fetch(`/${location}/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ProductName: productName,
                      Price: parseFloat(price),
                      Stock: parseInt(stock)
                    })
                  }).then(res => res.json());
                }
              
                alert(response.message || 'Data updated in combined view');
                fetchData();  // Refresh data display
              }
              

              async function deleteData(productId) {
                const location = document.getElementById("databaseSelect").value;
              
                if (!confirm("Are you sure you want to delete this item?")) return;
              
                let response;
                if (location === 'both') {
                  const mongoResponse = await fetch(`/locationB/${productId}`, {
                    method: 'DELETE'
                  });
              
                  const mysqlResponse = await fetch(`/locationA/${productId}`, {
                    method: 'DELETE'
                  });
              
                  response = await Promise.all([mongoResponse.json(), mysqlResponse.json()]);
                } else {
                  response = await fetch(`/${location}/${productId}`, {
                    method: 'DELETE'
                  }).then(res => res.json());
                }
              
                alert(response.message || 'Data deleted in combined view');
                fetchData();  // Refresh data display
              }
              
