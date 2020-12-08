var users = [];
var company = document.getElementById("btn_company");
if(company){
    //check if the user enters as a company
    company.addEventListener("click", function(event) {
        event.preventDefault();
        var signIn = document.getElementById("btn_signIn");
        if (signIn) {
            //if the user wants to sign in save the username and password to localStorage
            signIn.addEventListener("click", function(event) { 
                event.preventDefault(); //to stop the form submitting
                //user Object
                var user = {
                    id: Date.now(),
                    username: document.getElementById("username").value,
                    password: document.getElementById("password").value
                }
                //save the user object to local Storage
                localStorage.setItem('UserLists', JSON.stringify(user));

                // if(users.length > 1) {
                //     for(var i=0; i<users.length; i++){
                //         if(document.getElementById("username").value != users[i].username){
                //             console.log(users[i].username);
                //             users.push(user);
                //         }
                //     }
                // }
                // else{
                //     users.push(user);
                // }

                

                // make sure that the user introduce a username and a password, if not show message error
                if(document.getElementById("username").value !='' && document.getElementById("password").value !=''){
                    window.location="company.html";
                }
                else {
                    alert('Introduce user and password');
                }
            });
        }
    });
    
}

  