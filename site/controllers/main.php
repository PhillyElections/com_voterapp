<?php

// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Item Controller for Voterapp Component.
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 *
 * @license    GNU/GPL
 */
class VoterappControllerMain extends VoterappController
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
