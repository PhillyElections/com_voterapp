<?php

// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Item Controller for Voterapp2 Component.
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 *
 * @license    GNU/GPL
 */
class Voterapp2ControllerMain extends Voterapp2Controller
{
    /**
     * Display the edit form.
     *
     * @return void
     */
    public function display()
    {
        JRequest::setVar('view', 'main');

        parent::display();
    }
}
