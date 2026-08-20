<?php

namespace App\Notes\Domain\Services;

use League\CommonMark\CommonMarkConverter;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\MarkdownConverter;

class NoteContentStripper
{
	private MarkdownConverter $converter;

	public function __construct() {
		$environment = new Environment();
		$environment->addExtension(new CommonMarkCoreExtension());
		$this->converter = new MarkdownConverter($environment);
	}

	public function stripMarkdownToText(string $markdown): string
	{
		$html = $this->converter->convert($markdown)->getContent();

		$text = strip_tags($html);

		$text = preg_replace('/\s+/', ' ', $text);

		return trim($text);
	}

}