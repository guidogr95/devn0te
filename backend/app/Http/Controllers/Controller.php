<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\AuthenticatedUser;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, AuthenticatedUser;
}
