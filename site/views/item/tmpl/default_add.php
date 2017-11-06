<?php
// no direct access
defined('_JEXEC') or die('Restricted access');

if (count(JRequest::getVar('msg', null, 'post'))) {
    foreach (JRequest::getVar('msg', null, 'post') as $msg) {
        JError::raiseWarning(1, $msg);
    }
}

// lets go through the post array and extract any existing values for display
$data = JRequest::get('post');

?>
<form action="<?php echo JRoute::_('index.php?option=com_voterapp2'); ?>" method="post" id="adminForm" name="adminForm" class="form-validate">
    <table cellpadding="0" cellspacing="0" border="0" class="adminform">
        <tbody>
            <tr>
                <td width="200" height="30">
                    <label id="fieldmsg" for="field"><?php echo JText::_('FIELD'); ?>:</label>
                </td>
                <td>
                    <input type="text" id="field" name="field" size="62" value="<?php echo $data['field']; ?>" class="input_box" maxlength="100" />
                </td>
            </tr>
            <tr>
                <td height="30">&nbsp;</td>
                <td>
                    <button class="button validate" type="submit"><?php echo JText::_('ADD'); ?></button>
                    <input type="hidden" name="task" value="add" />
                    <input type="hidden" name="controller" value="item" />
                </td>
            </tr>
        </tbody>
    </table>
    <?php echo JHTML::_('form.token'); ?>
</form>