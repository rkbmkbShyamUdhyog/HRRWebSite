import * as categoryService from '../services/category.service.js';

export function listCategories(req, res, next) {
  try {
    res.json(categoryService.getCategories());
  } catch (err) {
    next(err);
  }
}
