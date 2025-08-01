<?php

namespace App\Notes\Domain\Services;

class NoteContentStripper
{
	public function stripHtmlToText(string $html): string
	{
		$text = strip_tags($html);
		$test = preg_replace('/\s+/', ' ', $text);
		return trim($text);
	}

}