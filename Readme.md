## BASE URL: https://ecommerce-api-8ga2.onrender.com

### ENDPOINTS:
all products: [GET]: /api/product


USER:
 - registration: [POST]: /api/user/register
  - fields: firstname, lastname, gender, email, password, role="user"

 - login: [POST]: /api/user/login
  - fields: email, password, role="user"

 - logout: [POST]: /api/user/logout


CART:
 - add to cart: [POST]: /api/cart/add
  - format to send:
	{
  		"productId": "66f18c7e3ebaaeac81783c2f",
		"quantity": 1,
		"attributes": {
			"color": "red",
			"size": "M"
		}
	}

 - fetch user cart: [GET]: /api/cart/get