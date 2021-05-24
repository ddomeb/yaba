
export interface MainCategory {
  name: string;
  description?: string;
  readonly isIncome: boolean;
  readonly id: number;
}

export interface SubCategory {
  name: string;
  description?: string;
  readonly id: number;
}

export interface MainCategoryDetails extends MainCategory {
  readonly subcategories: Array<SubCategory>;
}

export interface SubcategoryWithPk extends SubCategory {
  readonly main_category: number;
}
