  import { Injectable } from '@angular/core';

  @Injectable({
    providedIn: 'root'
  })
  export class ValidationService {

    /**
     * Check if a value is duplicate in a list of objects (active only)
     * Spaces are ignored, case-insensitive
     * @param value string to check
     * @param list array of objects
     * @param fieldName field to check in object
     * @param ignoreId optional: ID to ignore (for edit)
     * @returns true if duplicate exists
     */
    isDuplicate(
      value: string | undefined,
      list: any[],
      fieldName: string,
      ignoreId?: number
    ): boolean {
      if (!value) return false;

      const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

      return list.some(item => {
        const itemValue = (item[fieldName] || '').replace(/\s+/g, '').toLowerCase();
        const isActive = item['isActive'] ?? item['IsActive'] ?? false;

        // detect the object's ID field
        const id = item.id ?? item.brandID ?? item.categoryID ?? item.productID;

        return isActive && itemValue === normalizedValue && id !== ignoreId;
      });
    }
  }
