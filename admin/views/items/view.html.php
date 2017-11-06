<?php

// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Items View for Voterapp Component.
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 *
 * @license    GNU/GPL
 */
class VoterappViewItems extends JView
{
    /**
     * Items view display method.
     *
     * @param null|mixed $tpl
     *
     * @return void
     **/
    public function display($tpl = null)
    {
        JToolBarHelper::title(JText::_('Voterapp Items Manager'), 'generic.png');
        JToolBarHelper::deleteList();
        JToolBarHelper::editListX();
        JToolBarHelper::addNewX();

        d($this);
        $items      = &$this->get('Data');
        $pagination = &$this->get('Pagination');

        $this->assignRef('items', $items);
        $this->assignRef('pagination', $pagination);

        parent::display($tpl);
    }
}
