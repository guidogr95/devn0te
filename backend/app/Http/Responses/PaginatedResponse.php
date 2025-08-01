<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class PaginatedResponse
 *
 * @template T
 */
class PaginatedResponse
{

	/**
	* @var array<T>
	*/
	protected $data;
	/**
	* @var LengthAwarePaginator<T>
	*/
	protected LengthAwarePaginator $paginator;

	/**
 	* PaginatedResponse constructor.
	*
	* @param LengthAwarePaginator<T> $paginator
	*/
	public function __construct(LengthAwarePaginator $paginator)
	{
		$this->data = $paginator->items();
		$this->paginator = $paginator;
	}

	/**
	 * Convert the response to an array.
	 *
	 * @return array{
	 *     status: string,
	 *     data: array<T>,
	 *     pagination: array{
	 *         current_page: int,
	 *         per_page: int,
	 *         total_items: int,
	 *         last_page: int,
	 *         pages_left: int,
	 *     }
	 * }
	 */
	public function toArray(): array
	{
		return [
			'status' => 'success',
			'data' => $this->data,
			'pagination' => [
				'current_page' => $this->paginator->currentPage(),
				'per_page' => $this->paginator->perPage(),
				'total_items' => $this->paginator->total(),
				'last_page' => $this->paginator->lastPage(),
				'pages_left' => $this->paginator->lastPage() - $this->paginator->currentPage()
			]
		];
	}

}
