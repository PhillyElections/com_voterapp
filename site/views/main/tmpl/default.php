<script>
  var ward_divisions_files = {}
</script>
<?php
jimport('kint.kint');

?>
<script>
    ward_divisions_files = <?php echo json_encode($this->items); ?>
</script>
<?php
$document = JFactory::getDocument();

$document->addStyleSheet('components/com_voterapp/assets/css/map.css');
$document->addCustomTag('<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=places&key=AIzaSyDKUKOnN7xvUV31IcZrXFYYqtLYrkO38hw"></script>');
$document->addCustomTag('<script src="components/com_voterapp/assets/js/infobox_packed.js"></script>');
$document->addCustomTag('<!--[if lt IE 9]>
    <script src="https://codeorigin.jquery.com/jquery-1.10.2.min.js"></script>
    <![endif]-->
    <!--[if gte IE 9]><!-->
    <script src="https://codeorigin.jquery.com/jquery-2.0.3.min.js"></script>
    <!--<![endif]-->');
$document->addCustomTag('<script src="https://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>');
$document->addStyleSheet('https://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css');
require_once(JPATH_COMPONENT.DS.'assets'.DS.'helpers'.DS.'jsjtext.php');
    jsJText::script('YOUR POLLING PLACE');
    jsJText::script('WARD');
    jsJText::script('DIVISION');
    jsJText::script('P_LOCATION');
    jsJText::script('P_ADDRESS');
    jsJText::script('P_ACCESSIBILITY');
    jsJText::script('P_PARKING');
    jsJText::script('DIRECTIONS');
    jsJText::script('WALKING');
    jsJText::script('BICYCLING');
    jsJText::script('DRIVING');
    jsJText::script('DISCLAIMER');
    jsJText::script('EMAIL');
    jsJText::script('WEBSITE');
    jsJText::script('MORE INFORMATION');
    jsJText::script('MAIN OFFICE');
    jsJText::script('LOCAL OFFICE');
    jsJText::script('PHONE');
    jsJText::script('FAX');
    jsJText::script('OFFICE_ADDRESS');
    jsJText::script('ALTERNATE ENTRANCE');
    jsJText::script('BUILDING SUBSTANTIALLY ACCESSIBLE');
    jsJText::script('ACCESSIBLE WITH RAMP');
    jsJText::script('BUILDING ACCESSIBILITY MODIFIED');
    jsJText::script('BUILDING FULLY ACCESSIBLE');
    jsJText::script('BUILDING NOT ACCESSIBLE');
    jsJText::script('NO PARKING');
    jsJText::script('HANDICAP PARKING');
    jsJText::script('LOADING ZONE');
    jsJText::script('GENERAL PARKING');
    jsJText::script('DOWNLOAD BALLOT INTRO HEADER');
    jsJText::script('DOWNLOAD BALLOT INTRO TEXT');
    jsJText::script('DOWNLOAD BALLOT BUTTON TEXT');
    jsJText::script('OTHER SAMPLE BALLOTS HEADER');
    jsJText::script('OTHER SAMPLE BALLOTS TEXT');
    jsJText::script('DOWNLOAD BALLOT INTRO TEXT NO BALLOT');
    jsJText::script('OTHER SAMPLE BALLOTS HEADER');
    jsJText::script('DOWNLOAD BALLOT INTRO TEXT AFTER');
    jsJText::script('DOWNLOAD BALLOT INTRO HEADER AFTER');
    jsJText::script('DOWNLOAD BALLOT INTRO HEADER NO BALLOT');
    jsJText::script('DOWNLOAD BALLOT EMPTY DROPDOWN TEXT');
    jsJText::script('SHOW ME TEXT');
    jsJText::script('MODALBOX TEXT');
    jsJText::script('MODALBOX LAST OPTION');
  // after all the strings are listed, call jsJText::load()
  jsJText::load();
$document->addStyleSheet('components/com_voterapp/assets/js/select2/select2.css');
/*$document->addCustomTag('<script type="text/javascript" src="components/com_voterapp/assets/js/select2/select2.js"></script>');
$document->addCustomTag('<script type="text/javascript" src="components/com_voterapp/assets/js/map.js"></script>');*/

$user =& JFactory::getUser();

?>


<!--[if lt IE 7]>
<style media="screen" type="text/css">
.col1 {
  width:100%;
}
</style>
<![endif]-->

<!--
<style>
  #target {
    width: 345px;
  }
</style>
-->

<script type="text/javascript">
  var baseUri = "<?php echo JURI::base(); ?>";
</script>
<div class="colmask leftmenu">
    <div class="colright">
        <div class="col1wrap">
            <div class="col1">
              <!-- Column 2 start -->
              <div id="panel">
                <p class="address"><?php echo JText::_('USER ADDRESS'); ?> <input id="target" type="text" placeholder="<?php echo JText::_('PLACEHOLDER'); ?>"></p>
              </div>
              <div class="clear"></div>
              <div id="nav">
                <ul>
                  <li class="active" id="nav-polling-place"><span><?php echo JText::_('POLLING PLACE'); ?></span></li>
                  <li id="nav-elected-officials"><span><?php echo JText::_('ELECTED OFFICIALS'); ?></span></li>
                  <li id="nav-maps"><span><?php echo JText::_('MAPS'); ?></span></li>
           <?php //if($user->id > 0) {?>
          <li id="nav-download-ballot"><span><?php echo JText::_('SAMPLE BALLOT'); ?></span></li>
          <?php //}?>
                  <li id="print-map"><span><?php echo JText::_('MAP PRINT'); ?></span></li>
                </ul>
              </div>
              <div id="map-canvas"></div>
              <div id="sample-pdf" style="display:none;height:645px"></div>
              <!-- Column 2 end -->
            </div>
        </div>
        <div class="col2">
          <!-- Column 1 start -->
          <div id="menu-logo"></div>
          <div class="clear"></div>
          <div id="polling-place">
            <div id="polling-place-intro">
              <h3><?php echo JText::_('POLLING PLACE INTRO HEADER'); ?></h3>
              <br/>
              <p><?php echo JText::_('POLLING PLACE INTRO TEXT'); ?></p>
            </div>
            <div id="polling-place-main"></div>
          </div>
          <div id="elected-officials" style="display:none;">
            <div id="elected-officials-intro">
              <h3><?php echo JText::_('ELECTED OFFICIALS INTRO HEADER'); ?></h3>
              <p><?php echo JText::_('ELECTED OFFICIALS INTRO TEXT'); ?></p>
            </div>

            <div id="elected-officials-info">
              <h3><?php echo JText::_('ELECTED OFFICIALS INTRO HEADER'); ?></h3>

              <dl class="office-level-accordion accordion">
                <dt><a href="" class="active"><?php echo JText::_('LOCAL'); ?></a></dt>
                <dd id="local-accordion">
                  <dl class="office-accordion accordion">
                    <dt><a href="" class="active"><?php echo JText::_('MAYOR'); ?></a></dt>
                    <dd id="mayor"></dd>

                    <dt><a href=""><?php echo JText::_('DISTRICT ATTORNEY'); ?></a></dt>
                    <dd id="district-attorney"></dd>

                    <dt><a href=""><?php echo JText::_('CITY CONTROLLER'); ?></a></dt>
                    <dd id="city-controller"></dd>

                    <dt><a href=""><?php echo JText::_('REGISTER OF WILLS'); ?></a></dt>
                    <dd id="register-of-wills"></dd>

                    <dt><a href=""><?php echo JText::_('SHERIFF'); ?></a></dt>
                    <dd id="sheriff"></dd>

                    <dt><a href=""><?php echo JText::_('CITY COMMISSIONERS'); ?></a></dt>
                    <dd id="city-commissioners"></dd>

                    <dt><a href=""><?php echo JText::_('CITY COUNCIL AT LARGE'); ?></a></dt>
                    <dd id="city-council-at-large"></dd>

                    <dt><a href=""><?php echo JText::_('CITY COUNCIL'); ?></a></dt>
                    <dd id="city-council"></dd>
                  </dl>
                </dd>

                <dt><a href=""><?php echo JText::_('STATE'); ?></a></dt>
                <dd id="state-accordion">
                  <dl class="office-accordion accordion">
                    <dt><a href=""><?php echo JText::_('GOVERNOR'); ?></a></dt>
                    <dd id="governor"></dd>

                    <dt><a href=""><?php echo JText::_('LIEUTENANT GOVERNOR'); ?></a></dt>
                    <dd id="lieutenant-governor"></dd>

                    <dt><a href=""><?php echo JText::_('ATTORNEY GENERAL'); ?></a></dt>
                    <dd id="attorney-general"></dd>

                    <dt><a href=""><?php echo JText::_('STATE TREASURER'); ?></a></dt>
                    <dd id="state-treasurer"></dd>

                    <dt><a href=""><?php echo JText::_('AUDITOR GENERAL'); ?></a></dt>
                    <dd id="auditor-general"></dd>

                    <dt><a href=""><?php echo JText::_('STATE SENATOR'); ?></a></dt>
                    <dd id="state-senator"></dd>

                    <dt><a href=""><?php echo JText::_('STATE REPRESENTATIVE'); ?></a></dt>
                    <dd id="state-representative"></dd>
                  </dl>
                </dd>

                <dt><a href=""><?php echo JText::_('FEDERAL'); ?></a></dt>
                <dd id="federal-accordion">
                  <dl class="office-accordion accordion">
                    <dt><a href=""><?php echo JText::_('PRESIDENT'); ?></a></dt>
                    <dd id="potus"></dd>

                    <dt><a href=""><?php echo JText::_('UNITED STATES SENATORS'); ?></a></dt>
                    <dd id="us-senators"></dd>

                    <dt><a href=""><?php echo JText::_('UNITED STATES REPRESENTATIVE'); ?></a></dt>
                    <dd id="us-representative"></dd>
                  </dl>
                </dd>
              </dl>
            </div>
          </div>
          <div id="maps">
            <div id="maps-intro">
              <h3><?php echo JText::_('MAPS INTRO HEADER'); ?></h3>
              <br/>
              <p><?php echo JText::_('MAPS INTRO TEXT'); ?></p>
            </div>
            <div id="maps-info">
              <h3><?php echo JText::_('MAPS INTRO HEADER'); ?></h3>
              <br/>
              <p><?php echo JText::_('MAPS INFO TEXT'); ?></p>
              <br/>
              <h4><?php echo JText::_('MAPS DISTRICT SELECTOR HEADER'); ?></h4>
              <select id="maps-district-type"></select>
            </div>
            <hr class="dashed" />
            <div id="maps-custom-info">
              <h3><?php echo JText::_('MAPS CUSTOM INFO HEADER'); ?></h3>
              <br/>
              <p><?php echo JText::_('MAPS CUSTOM INFO TEXT'); ?></p>
              <br/>
              <h4><?php echo JText::_('DIVISION'); ?></h4>
              <select class="custom-map-selector" id="custom-divisions" multiple="true" disabled="true"></select>
              <h4><?php echo JText::_('WARD'); ?></h4>
              <select class="custom-map-selector" id="custom-wards" multiple="true" disabled="true"></select>
              <h4><?php echo JText::_('COUNCIL'); ?></h4>
              <select class="custom-map-selector" id="custom-council-districts" multiple="true" disabled="true"></select>
              <h4><?php echo JText::_('STATE REPRESENTATIVE'); ?></h4>
              <select class="custom-map-selector" id="custom-parep-districts" multiple="true" disabled="true"></select>
              <h4><?php echo JText::_('STATE SENATE'); ?></h4>
              <select class="custom-map-selector" id="custom-pasen-districts" multiple="true" disabled="true"></select>
              <h4><?php echo JText::_('US CONGRESS'); ?></h4>
              <select class="custom-map-selector" id="custom-uscongress-districts" multiple="true" disabled="true"></select>
            </div>
          </div>
      
      <!-- Download Ballot Div Start -->
      <div id="download-ballot" style="display:none;">
            <div id="download-ballot-intro">
              <h3><?php echo JText::_('DOWNLOAD BALLOT INTRO HEADER'); ?></h3>
              <p><?php echo JText::_('DOWNLOAD BALLOT INTRO TEXT'); ?></p>
            </div>

            <div id="download-ballot-info" style="text-decoration: none;display:none;">
              <!-- <a id="ballot-file-path" ><h5><span style="margin-left: 10px;"></span></h5></a> -->
            </div>
          </div>
      <!-- Download Ballot Div End   -->
          <!-- Column 1 end -->
        </div>
    </div>
</div>
<!--
<div class="art-footer-body" style="background-color:#8C887D!important;width: 1000px;    margin: 0 auto;padding: 15px 0px;">
                <div class="art-footer-text">
                                        <div class="art-nostyle">
<p>
  Copyright © 2013. All Rights Reserved.</p></div>
                                    </div>
        <div class="cleared"></div>
    </div>-->
<div id="cstm-score-address-popup" style="display:none;" title="<?php echo JText::_('MODALBOX TEXT'); ?>" class="custom-class">
<p class="validateTips"></p>
<table width=" 100%" cellspacing="0" cellpadding="3" id="multiple_address_tbl">
  <tr>
    <td><input type="radio" name="address_vals" value="male">Male</td>
  </tr>
  <tr>
    <td><input type="radio" name="address_vals" value="female">Female</td>
  </tr>
</table>
<br/>
</div>
<script type="text/javascript" src="components/com_voterapp/assets/js/select2/select2.js"></script>
<script type="text/javascript" src="components/com_voterapp/assets/js/map.js"></script>