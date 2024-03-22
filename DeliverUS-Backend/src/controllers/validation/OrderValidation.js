import { check } from 'express-validator'
import { checkRestaurantExists } from '../../controllers/validation/ProductValidation'
import { Product /* Restaurant */ } from '../../models/models'

// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

const checkProductIsAvailable = async (value, { req }) => {
  try {
    const productsArray = req.body.products
    for (let i = 0; i < productsArray.length; i++) {
      const orderProductInfo = productsArray[i]
      const productToCheck = await Product.findByPk(orderProductInfo.productId)
      if (productToCheck.availability === false) {
        return Promise.reject(new Error('The restaurantId does not exist.'))
      }
    }
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

// const checkAllProdSameRest = async (value, { req }) => {
//   try {
//     const restaurant = await Restaurant.findByPk(req.body.restaurantId)
//     const products = req.body.products
//     for (let i = 0; i < products.length; i++) {
//       const product = await Product.findByPk(products[i])
//       if (!(restaurant.restaurantId === product.restaurantId)) {
//         return Promise.reject(new Error('Not all products belong to the same restaurant'))
//       }
//     }
//     return Promise.resolve()
//   } catch (err) {
//     return Promise.reject(new Error(err))
//   }
// }

const create = [
  check('restaurantId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').custom(checkRestaurantExists),
  check('products').exists().isArray().notEmpty(),
  check('products.*.productId').exists().isInt({ min: 1 }).toInt(),

  check('products').custom(checkProductIsAvailable),
  check('products.*.quantity').exists().isInt({ min: 1 }).toInt(),
  // check('products').custom(checkAllProdSameRest),

  check('userId').not().exists(),
  check('price').not().exists(),
  check('address').optional({ nullable: true, checkFalsy: true }).isString(),
  check('shippingCosts').not().exists()
]

// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
  check('restaurantId').not().exists(),
  check('products').exists().isArray().notEmpty(),
  check('products.*.productId').exists().isInt({ min: 1 }).toInt(),
  check('products.*').custom(checkProductIsAvailable),
  check('status').equals('pending')
]

export { create, update }
