<?php
namespace App\Notes\Domain\ValueObjects;

class NotePreview
{
	private string $value;
	
	public function __construct(string $content)
	{
		$this->value = $this->generatePreview($content);
	}
	
	private function generatePreview(string $content): string
	{
		$words = explode(' ', strip_tags($content));
		$preview = implode(' ', array_slice($words, 0, 100));
		
		return strlen($preview) < strlen($content) ? $preview . '...' : $preview;
	}
	
	public function getValue(): string
	{
		return $this->value;
	}
}