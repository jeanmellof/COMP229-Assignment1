/* 
Page: Update JavaScript
Student Name: Jean M. de Freitas
Student ID: 301125083
Date: 10/23/2020
*/

// ------------------- Modal View Functions -------------------

// Get the modal
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
function openModal() {
	modal.style.display = "block";
}
  
// When the user clicks the button, open the modal 
function closeModal() {
	modal.style.display = "none";
}
  
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
	modal.style.display = "none";
}
  
// When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
	if (event.target == modal) {
	  modal.style.display = "none";
	}
}

// ------------------- Button functions -------------------
  
function createForm(action, method, user = {name: '', number: '', email: ''}){
	modal.innerHTML = '';	
	let edit_form = document.createElement('FORM');
	edit_form.className = 'modal-content';
	edit_form.method = 'post';
	edit_form.action = action;
	for(attr in user){
		switch(attr){
			case 'name':
			edit_form.innerHTML += `<div class="form__group">
									<label class="form__label" >Name:</label>
									<input class="form__input" type="text" name="name" value="${user[attr]}" required>
									</div>`;
			break;
			case 'number':
			edit_form.innerHTML += `<div class="form__group">
									<label class="form__label" >Number:</label>
									<input class="form__input" type="text" name="number" value="${user[attr]}" required>
									</div>`;
			break;
			case 'email':
			edit_form.innerHTML += `<div class="form__group">
									<label class="form__label" >Email:</label>
									<input class="form__input" type="text" name="email" value="${user[attr]}" required>
									</div>`;
			break;
			default:
			break;
	  }
}
	  if(method === 'add'){
		  edit_form.innerHTML += `<input style="transform: translateY(5px) translateX(-5px);" class="btns_editModal" type="submit" value="Create">
	  <input style="transform: translate(5px, 5px);" onclick="closeModal();" class="btns_editModal" type="button" value="Cancel">`;
	  }else{
		  edit_form.innerHTML += `<input style="transform: translateY(5px) translateX(-5px);" class="btns_editModal" type="submit" value="Update">
	  <input style="transform: translateY(5px) translateX(0px);" onclick="location.href='/business_contacts/delete/${user._id}';" class="btns_editModal" type="button" value="Delete">
	  <input style="transform: translate(5px, 5px);" onclick="closeModal();" class="btns_editModal" type="button" value="Cancel">`;
	  }
	  modal.appendChild(edit_form);
}
  
function editContact(user_string){
	let user = JSON.parse(user_string);
	openModal();
	createForm(`/business_contacts/edit/${user._id}`, 'edit', user);
}
  
function addContact(){
	openModal();
	createForm(`/business_contacts/add`, 'add')
}

function logoutSession() {
	location.replace("/logout")
}