var company = document.getElementById("btn_company");
if(company){
    company.addEventListener("click",function(event) {
        var signIn = document.getElementById("btn_signIn");
        if (signIn) {
            signIn.addEventListener("click", function(event) {
                // event.preventDefault();
                console.log(document.getElementById("username").value);
                console.log(document.getElementById("password").value);
                var fs = require.main.require('fs');
                var data = fs.readFileSync('db.json');
                var words = JSON.parse(data);
                console.log(words);
            });
        }
    });
    
}
