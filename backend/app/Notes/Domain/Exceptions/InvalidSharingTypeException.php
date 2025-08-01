<?php

namespace App\Notes\Domain\Exceptions;

use DomainException;
use Throwable;

class InvalidSharingTypeException extends DomainException
{

	private int $errorCode;
	
	public function __construct(string $message = '', int $code = 0, Throwable|null $previous = null)
	{
		parent::__construct($message, $code, $previous);
		$this->errorCode = $code;
	}

	public function getErrorCode(): int
	{
		return $this->errorCode;
	}

}
