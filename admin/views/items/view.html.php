<?php

// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Items View for Voterapp2 Component.
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 *
 * @license    GNU/GPL
 */
class Voterapp2ViewItems extends JView
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
        JToolBarHelper::title(JText::_('Voterapp2 Items Manager'), 'generic.png');
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
