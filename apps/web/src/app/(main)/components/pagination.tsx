import { Button } from '@/components/ui/button';

export const RenderPaginationButtons = (
  totalPages: number,
  currentPage: number,
  handlePageChange: (page: number) => void,
) => {
  const buttons = [];

  if (totalPages <= 5) {
    // Jika total pages <= 5, tampilkan semua halaman
    for (let page = 1; page <= totalPages; page++) {
      buttons.push(
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Button>,
      );
    }
  } else {
    // Tampilkan halaman pertama, terakhir, dan beberapa di sekitarnya
    buttons.push(
      <Button
        key={1}
        variant={1 === currentPage ? 'default' : 'outline'}
        size="icon"
        className="h-8 w-8"
        onClick={() => handlePageChange(1)}
      >
        1
      </Button>,
    );

    if (currentPage > 3) {
      buttons.push(
        <Button
          key="left-ellipsis"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled
        >
          ...
        </Button>,
      );
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Button>,
      );
    }

    if (currentPage < totalPages - 2) {
      buttons.push(
        <Button
          key="right-ellipsis"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled
        >
          ...
        </Button>,
      );
    }

    buttons.push(
      <Button
        key={totalPages}
        variant={totalPages === currentPage ? 'default' : 'outline'}
        size="icon"
        className="h-8 w-8"
        onClick={() => handlePageChange(totalPages)}
      >
        {totalPages}
      </Button>,
    );
  }

  return buttons;
};
