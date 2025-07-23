
  document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('#productTabs .nav-link');
    const products = document.querySelectorAll('.product');

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        // Xoá class active khỏi tất cả tab
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        const filter = this.dataset.filter;

        products.forEach(product => {
          const category = product.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            product.style.display = 'block';
          } else {
            product.style.display = 'none';
          }
        });
      });
    });
  });

