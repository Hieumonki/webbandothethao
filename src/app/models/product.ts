export class Product {
  _id!: string;
  name!: string;
  price!: number;
  desc!: string;
  image!: string;
  imagerv!: string;
  imagervv!: string;
  imagervvv!: string;
  imagervvvv!: string;

  color!: string[] | string;
  size!: string[] | string;

  selectedColor?: string;
  selectedSize?: string;

  category!: any;
  tab?: string;
  describe!: string;
}
